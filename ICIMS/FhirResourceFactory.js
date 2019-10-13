
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

  function FhirResourceFactory() {

    this.CreatePathologyBundle = function (oModels) {
      return new CreatePathologyBundle(oModels);
    };

    function CreatePathologyBundle(oModels) {

      var FhirTool = new FhirTools();
      var FhirDataType = new FhirDataTypeTool();

      var IcimsProfileBase = "https://www.icims.com.au/fhir";

      var IcimsMessageBundleProfileName = "StructureDefinition/icims-message-bundle";
      var IcimsMessageHeaderProfileName = "StructureDefinition/icims-messageHeader";
      var IcimsDiagnosticReportProfileName = "StructureDefinition/icims-diagnosticReport";
      var IcimsPatientProfileName = "StructureDefinition/icims-patient";
      var IcimsObservationProfileName = "StructureDefinition/icims-observation";
      var IcimsOrganizationProfileName = "StructureDefinition/icims-organization";
      var IcimsProvenanceProfileName = "StructureDefinition/icims-provenance";


      var IcimsOrganizationId = "bab13701-776a-41fd-86a9-7aa19df2825d";
      var IcimsOrganizationName = "ICIMS";
      var IcimsOrganizationAliasArray = ["Innovative Clinical Information Management Systems"];

      var SAHOrganizationId = "95f4641f-6de7-470c-a44c-90ef5eb17faf";
      var SAHOrganizationName = "SAH";
      var SAHOrganizationAliasArray = ["SAN", "Sydney Adventist Hospital"];

      var EpiSoftTypeCode = "EPISOFT";
      var EpiSoftSystemGuid = "70a870ef-2a29-4475-bd1d-1604a7eacbe9";

      var SanAppsSendingApplicationCode = "SANAPPS";
      var CareZoneSendingApplicationCode = "CareZone";

      //When sending to a [base]/fhir/Bundle endpoint for testing as a POST
      //you can not have an id, however, when sending to $process-message you must
      var oBundle = new BundleFhirResource();
      oBundle.SetId(FhirTool.GetGuid());
      oBundle.SetType("message");
      var bundleProfileUrl = FhirTool.PathCombine([IcimsProfileBase, IcimsMessageBundleProfileName]);
      oBundle.SetMetaProfile([bundleProfileUrl]);

      //--------------------------------------------------------------------------
      //MessageHeader Resource
      //--------------------------------------------------------------------------
      var MessageHeaderId = oModels.Pathology.Meta.MessageControlID;
      var oMsgHeader = new MessageHeaderFhirResource();
      oMsgHeader.SetId(MessageHeaderId);
      var msgHeadProfileUrl = FhirTool.PathCombine([IcimsProfileBase, IcimsMessageHeaderProfileName], "/");
      oMsgHeader.SetMetaProfile([msgHeadProfileUrl]);
      var HeaderEventCoding = FhirDataType.GetCoding("diagnosticreport-provide", "http://hl7.org/fhir/message-events", "diagnosticreport-provide");
      oMsgHeader.SetEvent(HeaderEventCoding);
      oMsgHeader.SetDestination("ICIMS", undefined, oModels.FacilityConfig.EndPoint);
      oMsgHeader.SetTimestamp(FhirTool.SetTimeZone(oModels.Pathology.Meta.MessageDateTime.AsXML));
      var oReceiverReference = FhirDataType.GetReference("Organization", IcimsOrganizationId, IcimsOrganizationName);
      oMsgHeader.SetReceiver(oReceiverReference);
      var oSenderReference = FhirDataType.GetReference("Organization", SAHOrganizationId, SAHOrganizationName);
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

      var patientProfileUrl = FhirTool.PathCombine([IcimsProfileBase, IcimsPatientProfileName], "/");
      //var oMeta = FhirDataType.GetMeta(undefined, undefined, [patientProfileUrl], undefined, undefined);
      //oPatient.SetMeta(oMeta);
      oPatient.SetMetaProfile(["http://hl7.org.au/fhir/StructureDefinition/au-patient", patientProfileUrl]);

      var PatientIdentifierArray = [];

      //MRN
      var oPatMrnTypeCoding = FhirDataType.GetCoding("MR", "http://hl7.org/fhir/v2/0203", "Medical record number");
      var oPatMrnType = FhirDataType.GetCodeableConcept(oPatMrnTypeCoding, "Medical record number");
      var MrnIdentifier = FhirDataType.GetIdentifier("official", oPatMrnType,
        oModels.FacilityConfig.PrimaryMRNSystemUri,
        oModels.Pathology.Patient.PrimaryMrnValue);
      PatientIdentifierArray.push(MrnIdentifier);

      //MedicareNumber
      if (oModels.Pathology.Patient.MedicareNumberValue != null) {
        var oPatMedicareTypeCoding = FhirDataType.GetCoding("MC", "http://hl7.org/fhir/v2/0203", "Medicare Number");
        var oPatMedicareType = FhirDataType.GetCodeableConcept(oPatMedicareTypeCoding, "Medicare Number");
        var MedicareIdentifier = FhirDataType.GetIdentifier("official", oPatMedicareType,
          "http://ns.electronichealth.net.au/id/medicare-number",
          oModels.Pathology.Patient.MedicareNumberValue);
        PatientIdentifierArray.push(MedicareIdentifier);
      }

      oPatient.SetIdentifier(PatientIdentifierArray);

      var HumanName = FhirDataType.GetHumanName("official", oModels.Pathology.Patient.FormattedName,
        oModels.Pathology.Patient.Family,
        oModels.Pathology.Patient.Given,
        oModels.Pathology.Patient.Title);
      oPatient.SetName([HumanName]);
      oPatient.SetGender(oModels.Pathology.Patient.Gender);
      oPatient.SetBirthDate(oModels.Pathology.Patient.Dob.AsXML);

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
      var oPatientReference = FhirDataType.GetReference("Patient", PatientId, oModels.Pathology.Patient.FormattedName);
      var ObsCategoryCoding = FhirDataType.GetCoding("procedure", "http://hl7.org/fhir/observation-category", "Procedure");
      var ObsCategoryCodeableConcept = FhirDataType.GetCodeableConcept(ObsCategoryCoding);

      var BundleObservationResourceList = [];
      var DiagnosticReportObservationResourceList = [];

      //var AllowedObservationDataTypes = ["ST", "NM"];
      var obsProfileUrl = FhirTool.PathCombine([IcimsProfileBase, IcimsObservationProfileName]);

      var SubIdProcessedArray = [];
      var oArraySupport = new ArraySupport();
      BreakPoint;
      for (var i = 0; (i < oModels.Pathology.ObservationList.length); i++) {
        var oV2Obs = oModels.Pathology.ObservationList[i];
        if (oV2Obs.Code != "PDF" && oV2Obs.CodeSystem != "AUSPDI") {
          if (oV2Obs.SetId == null) {
            var oObservation = FhirObsFactory(oV2Obs, oModels.Pathology.Report.ReportIssuedDateTime.AsXML, oPatientReference, ObsCategoryCodeableConcept, obsProfileUrl);
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


              var oSubIdObsGroup = oArraySupport.Filter(oModels.Pathology.ObservationList, "SetId", oV2Obs.SetId);
              BundleObservationResourceList.push(oParentObservation);
              DiagnosticReportObservationResourceList.push(oParentObservation);
              for (var x = 0; (x < oSubIdObsGroup.length); x++) {
                var oSubObs = oSubIdObsGroup[x];
                var oSubObservation = FhirObsFactory(oSubObs, oModels.Pathology.Report.ReportIssuedDateTime.AsXML, oPatientReference, ObsCategoryCodeableConcept, obsProfileUrl);
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
      var oDiagRepProfileUrl = FhirTool.PathCombine([IcimsProfileBase, IcimsDiagnosticReportProfileName]);
      oDiagReport.SetMetaProfile([oDiagRepProfileUrl]);
      var oTypeCoding = FhirDataType.GetCoding("FILL", "http://hl7.org/fhir/identifier-type", "Filler Identifier");
      var oType = FhirDataType.GetCodeableConcept(oTypeCoding, "Report Identifier");

      var ReportIdentifier = null;
      if (oModels.Pathology.Meta.SendingApplication.toUpperCase() == CareZoneSendingApplicationCode.toUpperCase()) {
        ReportIdentifier = FhirDataType.GetIdentifier("official", oType,
          FhirTool.PreFixUuid(EpiSoftSystemGuid),
          oModels.Pathology.Report.FillerOrderNumberValue);
      } else if (oModels.Pathology.Meta.SendingApplication.toUpperCase() == SanAppsSendingApplicationCode.toUpperCase()) {
        ReportIdentifier = FhirDataType.GetIdentifier("official", oType,
          FhirTool.PreFixUuid(oModels.Pathology.Report.FillerOrderNumberUniversalId.toLowerCase()),
          oModels.Pathology.Report.FillerOrderNumberValue);
      }

      oDiagReport.SetIdentifierArray([ReportIdentifier]);
      oDiagReport.SetStatus(oModels.Pathology.Report.Status);

      var oCategoryCoding = FhirDataType.GetCoding(oModels.Pathology.Report.DiagServSectId, "http://hl7.org/fhir/v2/0074");
      var oCategoryCodeableConcept = FhirDataType.GetCodeableConcept(oCategoryCoding, "Diagnostic Service Section Codes");
      oDiagReport.SetCategory(oCategoryCodeableConcept);

      var oCodeCoding = null;
      if (oModels.Pathology.Report.ReportCode == null && oModels.Pathology.Report.ReportCodeDescription != null) {
        oCodeCoding = FhirDataType.GetCoding(undefined, undefined, oModels.Pathology.Report.ReportCodeDescription);
      } else {
        oCodeCoding = FhirDataType.GetCoding(oModels.Pathology.Report.ReportCode, "http://loinc.org", oModels.Pathology.Report.ReportCodeDescription);
      }

      var oCodeCodeableConcept = FhirDataType.GetCodeableConcept(oCodeCoding);
      oDiagReport.SetCode(oCodeCodeableConcept);
      oDiagReport.SetSubject(oPatientReference);

      oDiagReport.SetEffectiveDateTime(FhirTool.SetTimeZone(oModels.Pathology.Report.CollectionDateTime.AsXML));
      oDiagReport.SetIssued(FhirTool.SetTimeZone(oModels.Pathology.Report.ReportIssuedDateTime.AsXML));

      //Add Performer Practitioner
      BreakPoint;
      if (oPractitioner != null) {
        var oPerformerRoleCodeableConcept = undefined;
        if (oModels.Pathology.Meta.SendingApplication.toUpperCase() == CareZoneSendingApplicationCode.toUpperCase()) {
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
      oOrgIcims.SetId(IcimsOrganizationId);
      var oOrgProfileUrl = FhirTool.PathCombine([IcimsProfileBase, IcimsOrganizationProfileName]);
      oOrgIcims.SetMetaProfile(["http://hl7.org.au/fhir/StructureDefinition/au-organisation", oOrgProfileUrl]);
      oOrgIcims.SetName(IcimsOrganizationName);
      oOrgIcims.SetAlias(IcimsOrganizationAliasArray);
      //Add Organization ICIMS to Bundle
      oBundle.AddEntry(FhirTool.PreFixUuid(IcimsOrganizationId), oOrgIcims);

      //--------------------------------------------------------------------------
      //Organization SAH
      //--------------------------------------------------------------------------
      var oOrgSAH = new OrganizationFhirResource(SAHOrganizationId, SAHOrganizationName);
      oOrgSAH.SetId(SAHOrganizationId);
      oOrgSAH.SetMetaProfile([oOrgProfileUrl]);
      oOrgSAH.SetName(SAHOrganizationName);
      oOrgSAH.SetAlias(SAHOrganizationAliasArray);
      //Add Organization SAH to Bundle
      oBundle.AddEntry(FhirTool.PreFixUuid(SAHOrganizationId), oOrgSAH);

      //--------------------------------------------------------------------------
      //Provenance SAH
      //--------------------------------------------------------------------------
      var provenanceId = FhirTool.GetGuid();
      var oProvenance = new ProvenanceFhirResource();
      oProvenance.SetId(provenanceId);
      var oProvenanceProfileUrl = FhirTool.PathCombine([IcimsProfileBase, IcimsProvenanceProfileName]);
      oProvenance.SetMetaProfile([oProvenanceProfileUrl]);

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
      TargetReferenceArray.push(FhirDataType.GetReference("Organization", IcimsOrganizationId, "Organization ICIMS"));
      TargetReferenceArray.push(FhirDataType.GetReference("Organization", SAHOrganizationId, "Organization SAH"));
      oProvenance.SetTarget(TargetReferenceArray);

      var Today = FhirTool.GetNow();

      //var xDate = Date().toLocaleString();
      oProvenance.SetRecorded(Today);

      var activityCoding = FhirDataType.GetCoding("CREATE", "http://hl7.org/fhir/v3/DataOperation", "create");
      oProvenance.SetActivity(activityCoding);

      //var roleCoding = FhirDataType.GetCoding(code, codeSystem, display, version);
      //var roleCodeableConcept = FhirDataType.GetCodeableConcept(roleCoding, text);

      var whoReference = FhirDataType.GetReference(undefined, undefined, "HL7 Connect Integration Engine");
      var onBehalfOfReference = FhirDataType.GetReference("Organization", IcimsOrganizationId, "ICIMS");
      oProvenance.SetAgent(undefined, whoReference, onBehalfOfReference);

      var messageControlIdIdentifier = FhirDataType.GetIdentifier("official", undefined,
        "https://www.sah.org.au/systems/fhir/hl7-v2/message-control-id", oModels.Pathology.Meta.MessageControlID);
      oProvenance.SetEntity("source", messageControlIdIdentifier);

      //Add Provenanceto Bundle
      oBundle.AddEntry(FhirTool.PreFixUuid(provenanceId), oProvenance);

      return oBundle;
    }

    function FhirObsFactory(oV2Obs, ReportIssuedDateTime, oPatientReference, ObsCategoryCodeableConcept, obsProfileUrl) {
      if (oV2Obs.DataType == "ST" || oV2Obs.DataType == "NM") {
        var oFhirTool = new FhirTools();
        var oFhirDataType = new FhirDataTypeTool();
        var oObservation = new ObservationFhirResource();

        var ObservationId = oFhirTool.GetGuid();
        oObservation.SetId(ObservationId);
        oObservation.SetMetaProfile([obsProfileUrl]);
        oObservation.SetStatus(oV2Obs.Status);
        oObservation.SetCategory([ObsCategoryCodeableConcept]);
        var ObsCodeCoding = oFhirDataType.GetCoding(oV2Obs.Code,
          "https://www.sah.org.au/systems/fhir/observation/procedure-observation", oV2Obs.CodeDescription);
        var ObsCodeCodeableConcept = oFhirDataType.GetCodeableConcept(ObsCodeCoding);
        oObservation.SetCode(ObsCodeCodeableConcept);

        oObservation.SetSubject(oPatientReference);
        //Collection DateTime Clinically relevant date Time
        oObservation.SetEffectiveDateTime(oFhirTool.SetTimeZone(ReportIssuedDateTime));
        //Time off analyser, when the observation was observerd
        oObservation.SetIssued(oFhirTool.SetTimeZone(oV2Obs.ObsDateTime.AsXML));
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
        throw "OBX DataType in OBX-2 of " + oV2Obs.DataType + " is not supported in the FHIR output.";
      }
    }


  }