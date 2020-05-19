
<% include $repo$\FhirLibrary\STU3\Resource.js %>
<% include $repo$\FhirLibrary\STU3\DomainResource.js %>
<% include $repo$\FhirLibrary\STU3\BundleFhirResource.js %>
<% include $repo$\FhirLibrary\STU3\MessageHeaderFhirResource.js %>
<% include $repo$\FhirLibrary\STU3\OrganizationFhirResource.js %>
<% include $repo$\FhirLibrary\STU3\DiagnosticReportFhirResource.js %>
<% include $repo$\FhirLibrary\STU3\PatientFhirResource.js %>
<% include $repo$\FhirLibrary\STU3\ObservationFhirResource.js %>
<% include $repo$\FhirLibrary\STU3\ProvenanceFhirResource.js %>
<% include $repo$\FhirLibrary\STU3\PractitionerFhirResource.js %>
<% include $repo$\FhirLibrary\STU3\FhirDataTypeTool.js %>
<% include $repo$\FhirLibrary\STU3\FhirTools.js %>
<% include $repo$\ICIMS\Constants.js %>


  function FhirResourceFactory() {

    this.CreatePathologyBundle = function (oModels) {
      return new CreatePathologyBundle(oModels);
    };

    function CreatePathologyBundle(oModels) {

      var FhirTool = new FhirTools();
      var FhirDataType = new FhirDataTypeTool();
      var Constant = new Constants();

      BreakPoint;

      //When sending to a [base]/fhir/Bundle endpoint for testing as a POST
      //you can not have an id, however, when sending to $process-message you must
      var oBundle = new BundleFhirResource();
      oBundle.SetId(FhirTool.GetGuid());
      oBundle.SetType("message");
      oBundle.SetMetaProfile([Constant.fhirResourceProfile.icims.messageBundle]);

      //--------------------------------------------------------------------------
      //MessageHeader Resource
      //--------------------------------------------------------------------------
      var MessageHeaderId = oModels.Pathology.Meta.MessageControlID;
      var oMsgHeader = new MessageHeaderFhirResource();
      oMsgHeader.SetId(MessageHeaderId);
      oMsgHeader.SetMetaProfile([Constant.fhirResourceProfile.icims.messageHeader]);
      var HeaderEventCoding = FhirDataType.GetCoding("diagnosticreport-provide", "http://hl7.org/fhir/message-events", "diagnosticreport-provide");
      oMsgHeader.SetEvent(HeaderEventCoding);
      if (oModels.FacilityConfig.Implementation == ImplementationTypeEnum.CliniSearch) {
        oMsgHeader.SetDestination(Constant.organization.sah.application.cliniSearch.code, undefined, oModels.FacilityConfig.EndPoint);
      } else {
        oMsgHeader.SetDestination("ICIMS", undefined, oModels.FacilityConfig.EndPoint);
      }
      oMsgHeader.SetTimestamp(FhirTool.SetTimeZone(oModels.Pathology.Meta.MessageDateTime.AsXML));
      var oReceiverReference = FhirDataType.GetReference("Organization", Constant.organization.icims.id, Constant.organization.icims.name);
      oMsgHeader.SetReceiver(oReceiverReference);
      var oSenderReference = FhirDataType.GetReference("Organization", Constant.organization.sah.id, Constant.organization.sah.name);
      oMsgHeader.SetSender(oSenderReference);
      oMsgHeader.SetSource(oModels.Pathology.Meta.SendingApplication);
      var messageheaderResponseRequestExtension = FhirDataType.GetExtension("http://hl7.org/fhir/StructureDefinition/messageheader-response-request", "valueCode", "on-error");
      oMsgHeader.SetExtension(messageheaderResponseRequestExtension);
      var DiagnosticReportId = FhirTool.GetGuid();
      var oFocusReference = FhirDataType.GetReference("DiagnosticReport", DiagnosticReportId, "DiagnosticReport");
      oBundle.AddEntry(FhirTool.PreFixUuid(MessageHeaderId), oMsgHeader);

      //--------------------------------------------------------------------------
      //Patient Resource
      //--------------------------------------------------------------------------

      var PatientId = FhirTool.GetGuid();
      var oPatient = new PatientFhirResource();
      oPatient.SetId(PatientId);

      //var oMeta = FhirDataType.GetMeta(undefined, undefined, [patientProfileUrl], undefined, undefined);
      //oPatient.SetMeta(oMeta);
      oPatient.SetMetaProfile(["http://hl7.org.au/fhir/StructureDefinition/au-patient", Constant.fhirResourceProfile.icims.patient]);

      var PatientIdentifierArray = [];

      //MRN
      if (oModels.Pathology.Patient.PrimaryMrnValue != null) {
        var oPatMrnTypeCoding = FhirDataType.GetCoding("MR", "http://hl7.org/fhir/v2/0203", "Medical record number");
        var oPatMrnType = FhirDataType.GetCodeableConcept(oPatMrnTypeCoding, "Medical record number");
        var MrnIdentifier = FhirDataType.GetIdentifier("official", oPatMrnType,
          oModels.FacilityConfig.PrimaryMRNSystemUri,
          oModels.Pathology.Patient.PrimaryMrnValue);
        PatientIdentifierArray.push(MrnIdentifier);
      }
      //MedicareNumber
      if (oModels.Pathology.Patient.MedicareNumberValue != null) {
        var oPatMedicareTypeCoding = FhirDataType.GetCoding("MC", "http://hl7.org/fhir/v2/0203", "Medicare Number");
        var oPatMedicareType = FhirDataType.GetCodeableConcept(oPatMedicareTypeCoding, "Medicare Number");
        var MedicareIdentifier = FhirDataType.GetIdentifier("official", oPatMedicareType,
          "http://ns.electronichealth.net.au/id/medicare-number",
          oModels.Pathology.Patient.MedicareNumberValue);
        PatientIdentifierArray.push(MedicareIdentifier);
      }

      if (PatientIdentifierArray.length > 0) {
        oPatient.SetIdentifier(PatientIdentifierArray);
      }

      var HumanName = FhirDataType.GetHumanName("official", oModels.Pathology.Patient.FormattedName,
        oModels.Pathology.Patient.Family,
        oModels.Pathology.Patient.Given,
        oModels.Pathology.Patient.Title);
      oPatient.SetName([HumanName]);
      oPatient.SetGender(oModels.Pathology.Patient.Gender);
      oPatient.SetBirthDate(oModels.Pathology.Patient.Dob.AsXML);

      BreakPoint;
      var PatientAddress = oModels.Pathology.Patient.PatientAddress;
      var lineArray = [];
      if (PatientAddress.AddressLine1 != null) {
        lineArray.push(PatientAddress.AddressLine1);
      }
      if (PatientAddress.AddressLine2 != null) {
        lineArray.push(PatientAddress.AddressLine2);
      }

      var oAddress = FhirDataType.GetAddressAustrlian(undefined, PatientAddress.FormattedAddress,
        lineArray, PatientAddress.Suburb, undefined, PatientAddress.Postcode);
      oPatient.SetAddress([oAddress]);

      //--------------------------------------------------------------------------
      //Observation Resource List
      //--------------------------------------------------------------------------
      BreakPoint;
      var oPatientReference = FhirDataType.GetReference("Patient", PatientId, oModels.Pathology.Patient.FormattedName);
      if (oModels.Pathology.Meta.SendingFacility.toUpperCase() == Constant.organization.dhm.name.toUpperCase()) {
        var ObsCategoryCoding = FhirDataType.GetCoding("laboratory", "http://hl7.org/fhir/observation-category", "Laboratory");
      } else {
        var ObsCategoryCoding = FhirDataType.GetCoding("procedure", "http://hl7.org/fhir/observation-category", "Procedure");
      }

      var ObsCategoryCodeableConcept = FhirDataType.GetCodeableConcept(ObsCategoryCoding);
      var BundleObservationResourceList = [];
      var DiagnosticReportObservationResourceList = [];
      var SubIdProcessedArray = [];
      var oArraySupport = new ArraySupport();

      for (var i = 0; (i < oModels.Pathology.ObservationList.length); i++) {
        var oV2Obs = oModels.Pathology.ObservationList[i];
        if (oV2Obs.Code != "PDF" && oV2Obs.CodeSystem != "AUSPDI") {
          if (oV2Obs.SetId == null) {
            var oObservation = FhirObsFactory(oV2Obs,
              oModels.Pathology.Report.ReportIssuedDateTime.AsXML,
              oPatientReference,
              ObsCategoryCodeableConcept,
              Constant.fhirResourceProfile.icims.observation);
            BundleObservationResourceList.push(oObservation);
            DiagnosticReportObservationResourceList.push(oObservation);
          } else {

            if (!oArraySupport.Contains(SubIdProcessedArray, oV2Obs.SetId)) {
              var oParentObservation = new ObservationFhirResource();
              oParentObservation.SetId(FhirTool.GetGuid());
              var ObsCodeCoding = FhirDataType.GetCoding(oV2Obs.SetId,
                "https://www.sah.org.au/systems/fhir/observation/procedure-observation", oV2Obs.SetId);
              var ObsCodeCodeableConcept = FhirDataType.GetCodeableConcept(ObsCodeCoding);
              oParentObservation.SetCode(ObsCodeCodeableConcept);
              oParentObservation.SetSubject(oPatientReference);
              var oSubIdObsGroup = oArraySupport.Filter(oModels.Pathology.ObservationList, "SetId", oV2Obs.SetId);
              BundleObservationResourceList.push(oParentObservation);
              DiagnosticReportObservationResourceList.push(oParentObservation);
              for (var x = 0; (x < oSubIdObsGroup.length); x++) {
                var oSubObs = oSubIdObsGroup[x];
                var oSubObservation = FhirObsFactory(oSubObs,
                  oModels.Pathology.Report.ReportIssuedDateTime.AsXML,
                  oPatientReference,
                  ObsCategoryCodeableConcept,
                  Constant.fhirResourceProfile.icims.observation);
                var oSubObservationReference = FhirDataType.GetReference("Observation", oSubObservation.id, undefined);
                oParentObservation.AddRelated(oSubObservationReference, "has-member");
                BundleObservationResourceList.push(oSubObservation);
              }
              SubIdProcessedArray.push(oV2Obs.SetId);
            }
          }
        }
      }

      //--------------------------------------------------------------------------
      //PractitionerFhir Resource
      //--------------------------------------------------------------------------
      var oPractitioner = null;
      if (oModels.Pathology.OrderingPractitioner != null && oModels.Pathology.OrderingPractitioner.Family != null) {
        var oPractitioner = new PractitionerFhirResource();
        oPractitioner.SetId(FhirTool.GetGuid());
        //MedicareProviderNumber      
        var oPractitionerIdentifierArray = [];
        if (oModels.Pathology.OrderingPractitioner.MedicareProviderNumber != null) {
          var oPractMedicareProviderNumberTypeCoding = FhirDataType.GetCoding("UPIN", "http://terminology.hl7.org.au/CodeSystem/v2-0203", "Medicare Provider Number");
          var oPractMedicareProviderNumberType = FhirDataType.GetCodeableConcept(oPractMedicareProviderNumberTypeCoding, undefined);
          var oPractMedicareProviderNumberIdentifier = FhirDataType.GetIdentifier("official", oPractMedicareProviderNumberType,
            "http://ns.electronichealth.net.au/id/medicare-provider-number",
            oModels.Pathology.OrderingPractitioner.MedicareProviderNumber);
          oPractitionerIdentifierArray.push(oPractMedicareProviderNumberIdentifier);
          oPractitioner.SetIdentifierArray(oPractitionerIdentifierArray);
        }

        var oPractHumanName = FhirDataType.GetHumanName("official", oModels.Pathology.OrderingPractitioner.FormattedName,
          oModels.Pathology.OrderingPractitioner.Family,
          oModels.Pathology.OrderingPractitioner.Given,
          oModels.Pathology.OrderingPractitioner.Title);
        oPractitioner.SetName([oPractHumanName]);
      }

      //--------------------------------------------------------------------------
      //DiagnosticReport Resource
      //--------------------------------------------------------------------------
      var oDiagReport = new DiagnosticReportFhirResource();
      oDiagReport.SetId(DiagnosticReportId);
      if (oModels.Pathology.Meta.SendingFacility.toUpperCase() == Constant.organization.dhm.name.toUpperCase()) {
        var XhtmlNarrative = GetDiagnosticReportNarative(oModels.Pathology.DisplayDataLineList);
        var oNarrative = FhirDataType.GetNarrative("additional", XhtmlNarrative)
      }
      oDiagReport.SetText(oNarrative);
      oDiagReport.SetMetaProfile([Constant.fhirResourceProfile.icims.diagnosticReport]);
      var oTypeCoding = FhirDataType.GetCoding("FILL", "http://hl7.org/fhir/identifier-type", "Filler Identifier");
      var oType = FhirDataType.GetCodeableConcept(oTypeCoding, "Report Identifier");

      var ReportIdentifier = null;
      if (oModels.Pathology.Meta.SendingApplication.toUpperCase() == Constant.organization.sah.application.careZone.code.toUpperCase()) {
        ReportIdentifier = FhirDataType.GetIdentifier("official", oType,
          FhirTool.PreFixUuid(Constant.organization.sah.application.epiSoft.codeSystem.FillerOrderNumber),
          oModels.Pathology.Report.FillerOrderNumberValue);
      } else if (oModels.Pathology.Meta.SendingApplication.toUpperCase() == Constant.organization.sah.application.sanApps.code.toUpperCase()) {
        ReportIdentifier = FhirDataType.GetIdentifier("official", oType,
          FhirTool.PreFixUuid(oModels.Pathology.Report.FillerOrderNumberUniversalId.toLowerCase()),
          oModels.Pathology.Report.FillerOrderNumberValue);
      } else if (oModels.Pathology.Meta.SendingFacility.toUpperCase() == Constant.organization.dhm.name.toUpperCase()) {
        ReportIdentifier = FhirDataType.GetIdentifier("official", oType,
          Constant.organization.dhm.codeSystem.FillerOrderNumber,
          oModels.Pathology.Report.FillerOrderNumberValue);
      }

      oDiagReport.SetIdentifierArray([ReportIdentifier]);
      oDiagReport.SetStatus(oModels.Pathology.Report.Status);

      var oCategoryCoding = FhirDataType.GetCoding(oModels.Pathology.Report.DiagServSectId, "http://hl7.org/fhir/v2/0074");
      var oCategoryCodeableConcept = FhirDataType.GetCodeableConcept(oCategoryCoding, "Diagnostic Service Section Codes");
      oDiagReport.SetCategory(oCategoryCodeableConcept);

      var oCodeCoding = null;
      if (oModels.Pathology.Meta.SendingFacility.toUpperCase() == Constant.organization.dhm.name.toUpperCase()) {
        oCodeCoding = FhirDataType.GetCoding(oModels.Pathology.Report.ReportCode, Constant.organization.dhm.codeSystem.ReportPanel, oModels.Pathology.Report.ReportCodeDescription);
      } else {
        if (oModels.Pathology.Report.ReportCode == null && oModels.Pathology.Report.ReportCodeDescription != null) {
          oCodeCoding = FhirDataType.GetCoding(undefined, undefined, oModels.Pathology.Report.ReportCodeDescription);
        } else {
          oCodeCoding = FhirDataType.GetCoding(oModels.Pathology.Report.ReportCode, "http://loinc.org", oModels.Pathology.Report.ReportCodeDescription);
        }
      }



      var oCodeCodeableConcept = FhirDataType.GetCodeableConcept(oCodeCoding);
      oDiagReport.SetCode(oCodeCodeableConcept);
      oDiagReport.SetSubject(oPatientReference);

      oDiagReport.SetEffectiveDateTime(FhirTool.SetTimeZone(oModels.Pathology.Report.CollectionDateTime.AsXML));
      oDiagReport.SetIssued(FhirTool.SetTimeZone(oModels.Pathology.Report.ReportIssuedDateTime.AsXML));

      //Add Performer Practitioner      
      if (oPractitioner != null) {
        var oPerformerRoleCodeableConcept = undefined;
        if (oModels.Pathology.Meta.SendingApplication.toUpperCase() == Constant.organization.sah.application.careZone.code.toUpperCase()) {
          var oPerformerRoleCoding = FhirDataType.GetCoding("310512001", "http://snomed.info/sct", "Medical oncologist");
          oPerformerRoleCodeableConcept = FhirDataType.GetCodeableConcept(oPerformerRoleCoding, undefined);
        }
        var oPerformerActorPractitionerReference = FhirDataType.GetReference("Practitioner", oPractitioner.id, oModels.Pathology.OrderingPractitioner.FormattedName);
        oDiagReport.AddPerformer(oPerformerRoleCodeableConcept, oPerformerActorPractitionerReference);
      }
      //Add All the DiagnosticReportObservationResourceList References to the DiagnosticReport Resource
      var ResultReferenceArray = [];
      for (var i = 0; (i < DiagnosticReportObservationResourceList.length); i++) {
        var oObsReference = FhirDataType.GetReference("Observation", DiagnosticReportObservationResourceList[i].id, DiagnosticReportObservationResourceList[i].code.coding.display);
        ResultReferenceArray.push(oObsReference);
      }
      if (ResultReferenceArray.length > 0) {
        oDiagReport.SetResult(ResultReferenceArray);
      }

      //Get the base64 encoded PDF from the ObservationList and add to the DiagnosticReport Resource
      //property named 'presentedForm'
      if (oModels.FacilityConfig.SendPathologyPdfReport) {
        for (var i = 0; (i < oModels.Pathology.ObservationList.length); i++) {
          if (oV2Obs.Code == "PDF" && oV2Obs.CodeSystem == "AUSPDI") {
            var oPdfAttachment = FhirDataType.GetPdfAttachment(oV2Obs.Value);
            oDiagReport.SetPresentedForm([oPdfAttachment]);
            break;
          }
        }
      }

      //Add DiagnosticReport to Bundle
      oBundle.AddEntry(FhirTool.PreFixUuid(DiagnosticReportId), oDiagReport);

      //Add Practitioner to Bundle
      if (oPractitioner != null) {
        oBundle.AddEntry(FhirTool.PreFixUuid(oPractitioner.id), oPractitioner);
      }
      //Add Patient to Bundle
      oBundle.AddEntry(FhirTool.PreFixUuid(PatientId), oPatient);

      //Add Observations to Bundle
      for (var i = 0; (i < BundleObservationResourceList.length); i++) {
        oBundle.AddEntry(FhirTool.PreFixUuid(BundleObservationResourceList[i].id), BundleObservationResourceList[i]);
      }

      //--------------------------------------------------------------------------
      //Organization ICIMS
      //--------------------------------------------------------------------------
      var oOrgIcims = new OrganizationFhirResource();
      oOrgIcims.SetId(Constant.organization.icims.id);
      oOrgIcims.SetMetaProfile(["http://hl7.org.au/fhir/StructureDefinition/au-organisation", Constant.fhirResourceProfile.icims.organization]);
      oOrgIcims.SetName(Constant.organization.icims.name);
      oOrgIcims.SetAlias(Constant.organization.icims.aliasList);
      //Add Organization ICIMS to Bundle
      oBundle.AddEntry(FhirTool.PreFixUuid(Constant.organization.icims.id), oOrgIcims);

      //--------------------------------------------------------------------------
      //Organization SAH
      //--------------------------------------------------------------------------
      var oOrgSAH = new OrganizationFhirResource();
      oOrgSAH.SetId(Constant.organization.sah.id);
      oOrgSAH.SetMetaProfile(["http://hl7.org.au/fhir/StructureDefinition/au-organisation", Constant.fhirResourceProfile.icims.organization]);
      oOrgSAH.SetName(Constant.organization.sah.name);
      oOrgSAH.SetAlias(Constant.organization.sah.aliasList);
      //Add Organization SAH to Bundle
      oBundle.AddEntry(FhirTool.PreFixUuid(Constant.organization.sah.id), oOrgSAH);

      //--------------------------------------------------------------------------
      //Provenance SAH
      //--------------------------------------------------------------------------
      var provenanceId = FhirTool.GetGuid();
      var oProvenance = new ProvenanceFhirResource();
      oProvenance.SetId(provenanceId);
      oProvenance.SetMetaProfile([Constant.fhirResourceProfile.icims.provenance]);

      var TargetReferenceArray = [];
      TargetReferenceArray.push(FhirDataType.GetReference("MessageHeader", MessageHeaderId, "MessageHeader"));
      TargetReferenceArray.push(FhirDataType.GetReference("Patient", PatientId, "Patient"));
      TargetReferenceArray.push(FhirDataType.GetReference("DiagnosticReport", DiagnosticReportId, "DiagnosticReport"));
      if (oPractitioner != null) {
        TargetReferenceArray.push(FhirDataType.GetReference("Practitioner", oPractitioner.id, "Practitioner"));
      }
      for (var i = 0; (i < BundleObservationResourceList.length); i++) {
        TargetReferenceArray.push(FhirDataType.GetReference("Observation", BundleObservationResourceList[i].id, "Observation"));
      }
      TargetReferenceArray.push(FhirDataType.GetReference("Organization", Constant.organization.icims.id, "Organization ICIMS"));
      TargetReferenceArray.push(FhirDataType.GetReference("Organization", Constant.organization.sah.id, "Organization SAH"));
      oProvenance.SetTarget(TargetReferenceArray);

      var Today = FhirTool.GetNow();

      //var xDate = Date().toLocaleString();
      oProvenance.SetRecorded(Today);

      var activityCoding = FhirDataType.GetCoding("CREATE", "http://hl7.org/fhir/v3/DataOperation", "create");
      oProvenance.SetActivity(activityCoding);

      //var roleCoding = FhirDataType.GetCoding(code, codeSystem, display, version);
      //var roleCodeableConcept = FhirDataType.GetCodeableConcept(roleCoding, text);

      var whoReference = FhirDataType.GetReference(undefined, undefined, "HL7 Connect Integration Engine");
      var onBehalfOfReference = FhirDataType.GetReference("Organization", Constant.organization.icims.id, "ICIMS");
      oProvenance.SetAgent(undefined, whoReference, onBehalfOfReference);

      var messageControlIdIdentifier = FhirDataType.GetIdentifier("official", undefined,
        "https://www.sah.org.au/systems/fhir/hl7-v2/message-control-id", oModels.Pathology.Meta.MessageControlID);
      oProvenance.SetEntity("source", messageControlIdIdentifier);

      //Add Provenanceto Bundle
      oBundle.AddEntry(FhirTool.PreFixUuid(provenanceId), oProvenance);

      return oBundle;
    }

    function FhirObsFactory(oV2Obs, ReportIssuedDateTime, oPatientReference, ObsCategoryCodeableConcept, obsProfileUrl) {
      if (oV2Obs.DataType == "ST" || oV2Obs.DataType == "NM" || oV2Obs.DataType == "FT") {
        var oFhirTool = new FhirTools();
        var oFhirDataType = new FhirDataTypeTool();
        var oObservation = new ObservationFhirResource();

        var ObservationId = oFhirTool.GetGuid();
        oObservation.SetId(ObservationId);
        oObservation.SetMetaProfile([obsProfileUrl]);
        oObservation.SetStatus(oV2Obs.Status);
        oObservation.SetCategory([ObsCategoryCodeableConcept]);
        var ObsCodeCoding = null;
        if (oV2Obs.CodeSystem.toUpperCase() == "LN") {
          ObsCodeCoding = oFhirDataType.GetCoding(oV2Obs.Code,
            "http://loinc.org", oV2Obs.CodeDescription);
        } else {
          ObsCodeCoding = oFhirDataType.GetCoding(oV2Obs.Code,
            "https://www.sah.org.au/systems/fhir/observation/procedure-observation", oV2Obs.CodeDescription);
        }

        var ObsCodeCodeableConcept = oFhirDataType.GetCodeableConcept(ObsCodeCoding);
        oObservation.SetCode(ObsCodeCodeableConcept);

        oObservation.SetSubject(oPatientReference);
        //Collection DateTime Clinically relevant date Time
        oObservation.SetEffectiveDateTime(oFhirTool.SetTimeZone(ReportIssuedDateTime));
        //Time off analyser, when the observation was observerd
        if (oV2Obs.ObsDateTime != null) {
          oObservation.SetIssued(oFhirTool.SetTimeZone(oV2Obs.ObsDateTime.AsXML));
        }

        //Abnormal Flag (Interpretation)
        if (oV2Obs.InterpretationCode != null) {
          var InterpCoding = oFhirDataType.GetCoding(oV2Obs.InterpretationCode,
            "http://hl7.org/fhir/v2/0078", oV2Obs.InterpretationDesciption);
          var InterpCodeableConcept = oFhirDataType.GetCodeableConcept(InterpCoding);
          oObservation.SetInterpretation(InterpCodeableConcept);
        }
        //The Result
        if (oV2Obs.DataType == "ST") {
          oObservation.SetValueString(oV2Obs.Value);
        } else if (oV2Obs.DataType == "FT") {
          //Here we strip any Formated Text formating and add Json line breaks in place of HL7 V2 breaks e.g (\.br\)
          var StripFormatting = oV2Obs.Value
            .replace(/\\H\\/g, "") //HL7 V2 Highligh On
            .replace(/\\N\\/g, "") //HL7 V2 Highligh Off (Normal Text on)
            .replace(/\\.br\\/g, "\n") //HL7 V2 LineBreaks
            .replace(/\\X0D\\/g, "\n"); //Carriage return
          oObservation.SetValueString(StripFormatting);
        } else if (oV2Obs.DataType == "NM") {
          oObservation.SetValueQuantity(oFhirDataType.GetQuantity(oV2Obs.Value, undefined, oV2Obs.Units, undefined, undefined));
          if (oV2Obs.ReferenceRangeText != null) {
            var RangeTypeCodeCoding = oFhirDataType.GetCoding("normal",
              "http://hl7.org/fhir/referencerange-meaning", "Normal Range");
            var RangeTypeCodeCodeableConcept = oFhirDataType.GetCodeableConcept(RangeTypeCodeCoding);
            oObservation.SetReferenceRange(undefined, undefined, RangeTypeCodeCodeableConcept, undefined, undefined, oV2Obs.ReferenceRangeText);
          }
        }
        return oObservation;
      } else {
        throw new Error("OBX DataType in OBX-2 of " + oV2Obs.DataType + " is not supported in the FHIR output.");
      }
    }

    function GetDiagnosticReportNarative(DisplayLineList) {
      var oStringSupport = new StringSupport();
      var output = "<div xmlns=\"http://www.w3.org/1999/xhtml\">\n  <pre>"
      for (var i = 0; (i < DisplayLineList.length); i++) {
        output = output + oStringSupport.XMLEscape(DisplayLineList[i]) + "\n";
      }
      output = output + "  </pre>\n</div>";
      return output;
    }

  }