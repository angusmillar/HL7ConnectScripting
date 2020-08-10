
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
<% include $repo$\FhirLibrary\STU3\ProcedureRequestFhirResource.js %>
<% include $repo$\FhirLibrary\STU3\FhirDataTypeTool.js %>
<% include $repo$\FhirLibrary\STU3\FhirTools.js %>
<% include $repo$\ICIMS\Constants.js %>


  function FhirResourceFactory() {

    this.CreateDiagnosticReportBundle = function (oModels) {
      return new CreateDiagnosticReportBundle(oModels);
    };

    function CreateDiagnosticReportBundle(oModels) {

      var FhirDataType = new FhirDataTypeTool();
      var Constant = new Constants();

      BreakPoint;

      var BundleLogical = {
        MessageHeaderResource: null,
        PatientResource: null,
        OrganizationResourceList: [],
        DiagnosticReportLogicalList: [],
        ProvenanceResource: null
      }

      //--------------------------------------------------------------------------
      //MessageHeader Resource
      //--------------------------------------------------------------------------
      BundleLogical.MessageHeaderResource = FhirMessageHeaderFactory(oModels.DiagnosticReport.Meta, oModels.FacilityConfig);
      //--------------------------------------------------------------------------
      //Patient Resource
      //--------------------------------------------------------------------------
      BundleLogical.PatientResource = FhirPatientFactory(oModels.DiagnosticReport.Patient, oModels.FacilityConfig);
      var oPatientResourceReference = FhirDataType.GetReference("Patient", BundleLogical.PatientResource.id, oModels.DiagnosticReport.Patient.FormattedName);
      //========================================================================================================

      for (var r = 0; (r < oModels.DiagnosticReport.ReportList.length); r++) {
        var CurrentReport = oModels.DiagnosticReport.ReportList[r];

        var DiagnosticReportLogical = {
          DiagnosticReportResource: null,
          OrderingPractitionerResource: null,
          ProcedureRequestResource: null,
          ObservationResourceList: [],
          SubObservationResourceList: []
        }

        //Observation--------------------------------------------------          
        var DiagnosticReportLogical = FhirObservationFactory(CurrentReport.ObservationList, CurrentReport.ReportIssuedDateTime, oPatientResourceReference, oModels.FacilityConfig);

        //OrderingPractitioner--------------------------------------------------
        DiagnosticReportLogical.OrderingPractitionerResource = FhirPractitionerFactory(CurrentReport.OrderingPractitioner);
        var oPractitionerResourceReference = FhirDataType.GetReference("Practitioner", DiagnosticReportLogical.OrderingPractitionerResource.id, CurrentReport.OrderingPractitioner.FormattedName);
        //ProcedureRequest------------------------------------------------------
        var oProcedureRequestResourceReference = null;
        if (oModels.FacilityConfig.Implementation == ImplementationTypeEnum.CliniSearchPathology || oModels.FacilityConfig.Implementation == ImplementationTypeEnum.CliniSearchRadiology) {
          DiagnosticReportLogical.ProcedureRequestResource = FhirProcedureRequestFactory(oPatientResourceReference, oPractitionerResourceReference);
          var oProcedureRequestResourceReference = FhirDataType.GetReference("ProcedureRequest", DiagnosticReportLogical.ProcedureRequestResource.id, "ProcedureRequest");
        }
        //DiagnosticReport--------------------------------------------------        
        DiagnosticReportLogical.DiagnosticReportResource = FhirDiagnosticReportFactory(CurrentReport, oModels.DiagnosticReport.Meta.SendingFacility, oModels.DiagnosticReport.Meta.SendingApplication, oPatientResourceReference, oProcedureRequestResourceReference, oPractitionerResourceReference, DiagnosticReportLogical.ObservationResourceList, oModels.FacilityConfig);
        BundleLogical.DiagnosticReportLogicalList.push(DiagnosticReportLogical);

      }
      //Icims Organization
      BundleLogical.OrganizationResourceList.push(FhirOrganizationFactory(Constant.organization.icims.id, Constant.organization.icims.name, Constant.organization.icims.aliasList));
      if (oModels.FacilityConfig.Implementation == ImplementationTypeEnum.CliniSearchPathology) {
        //DHM Organization
        BundleLogical.OrganizationResourceList.push(FhirOrganizationFactory(Constant.organization.dhm.id, Constant.organization.dhm.name, Constant.organization.dhm.aliasList));
      } else {
        //SAH Organization
        BundleLogical.OrganizationResourceList.push(FhirOrganizationFactory(Constant.organization.sah.id, Constant.organization.sah.name, Constant.organization.sah.aliasLis));
      }

      BundleLogical.ProvenanceResource = FhirProvenanceFactory(BundleLogical, oModels.DiagnosticReport.Meta.MessageControlID, oModels.FacilityConfig);

      var oBundle = FhirBundleFactory(BundleLogical);

      return oBundle;
    }

    function FhirMessageHeaderFactory(oMeta, oFacilityConfig) {
      var oConstant = new Constants();
      var oFhirDataType = new FhirDataTypeTool();
      var oFhirTool = new FhirTools();

      var oMsgHeader = new MessageHeaderFhirResource();
      oMsgHeader.SetId(oMeta.MessageControlID);
      oMsgHeader.SetMetaProfile([oConstant.fhirResourceProfile.icims.messageHeader]);
      var HeaderEventCoding = oFhirDataType.GetCoding("diagnosticreport-provide", "http://hl7.org/fhir/message-events", "diagnosticreport-provide");
      oMsgHeader.SetEvent(HeaderEventCoding);
      if (oFacilityConfig.Implementation == ImplementationTypeEnum.CliniSearchPathology || oFacilityConfig.Implementation == ImplementationTypeEnum.CliniSearchRadiology) {
        oMsgHeader.SetDestination(oConstant.organization.sah.application.cliniSearch.code, undefined, oFacilityConfig.EndPoint);
      } else {
        oMsgHeader.SetDestination(oConstant.organization.icims.name, undefined, oFacilityConfig.EndPoint);
      }
      oMsgHeader.SetTimestamp(oFhirTool.FhirDateTimeFormat(oMeta.MessageDateTime.AsXML));
      var oReceiverReference = oFhirDataType.GetReference("Organization", oConstant.organization.icims.id, oConstant.organization.icims.name);
      oMsgHeader.SetReceiver(oReceiverReference);
      var oSenderReference = null;
      if (oFacilityConfig.Implementation == ImplementationTypeEnum.CliniSearchPathology) {
        oSenderReference = oFhirDataType.GetReference("Organization", oConstant.organization.dhm.id, oConstant.organization.dhm.name);
      } else {
        oSenderReference = oFhirDataType.GetReference("Organization", oConstant.organization.sah.id, oConstant.organization.sah.name);
      }
      oMsgHeader.SetSender(oSenderReference);
      oMsgHeader.SetSource(oMeta.SendingApplication);
      var messageheaderResponseRequestExtension = oFhirDataType.GetExtension("http://hl7.org/fhir/StructureDefinition/messageheader-response-request", "valueCode", "on-error");
      oMsgHeader.SetExtension(messageheaderResponseRequestExtension);

      // var DiagnosticReportIdArray = [];
      // var FocusArray = [];
      // for (var i = 0; (i < oModels.DiagnosticReport.ReportList.length); i++) {
      //   var DiagnosticReportId = oFhirTool.GetGuid();
      //   DiagnosticReportIdArray.push(DiagnosticReportId);
      //   var oFocusReference = oFhirDataType.GetReference("DiagnosticReport", DiagnosticReportId, "DiagnosticReport");
      //   FocusArray.push(oFocusReference);
      // }
      //oMsgHeader.SetFocus(FocusArray);
      return oMsgHeader;
    }

    function FhirPatientFactory(oPatient, oFacilityConfig) {
      var oFhirDataType = new FhirDataTypeTool();
      var oConstant = new Constants();
      var FhirTool = new FhirTools();
      var PatientId = FhirTool.GetGuid();
      var oPatientResource = new PatientFhirResource();
      oPatientResource.SetId(PatientId);

      oPatientResource.SetMetaProfile(["http://hl7.org.au/fhir/StructureDefinition/au-patient", oConstant.fhirResourceProfile.icims.patient]);

      var PatientIdentifierArray = [];

      //MRN
      if (oPatient.PrimaryMrnValue != null) {
        var oPatMrnTypeCoding = oFhirDataType.GetCoding("MR", "http://hl7.org/fhir/v2/0203", "Medical record number");
        var oPatMrnType = oFhirDataType.GetCodeableConcept(oPatMrnTypeCoding, "Medical record number");
        var MrnIdentifier = oFhirDataType.GetIdentifier("official", oPatMrnType,
          oFacilityConfig.PrimaryMRNSystemUri,
          oPatient.PrimaryMrnValue);
        PatientIdentifierArray.push(MrnIdentifier);
      }
      //MedicareNumber
      if (oPatient.MedicareNumberValue != null) {
        var oPatMedicareTypeCoding = oFhirDataType.GetCoding("MC", "http://hl7.org/fhir/v2/0203", "Medicare Number");
        var oPatMedicareType = oFhirDataType.GetCodeableConcept(oPatMedicareTypeCoding, "Medicare Number");
        var MedicareIdentifier = oFhirDataType.GetIdentifier("official", oPatMedicareType,
          "http://ns.electronichealth.net.au/id/medicare-number",
          oPatient.MedicareNumberValue);
        PatientIdentifierArray.push(MedicareIdentifier);
      }

      if (PatientIdentifierArray.length > 0) {
        oPatientResource.SetIdentifier(PatientIdentifierArray);
      }

      var HumanName = oFhirDataType.GetHumanName("official", oPatient.FormattedName,
        oPatient.Family,
        oPatient.Given,
        oPatient.Title);
      oPatientResource.SetName([HumanName]);
      oPatientResource.SetGender(oPatient.Gender);
      oPatientResource.SetBirthDate(oPatient.Dob.AsXML);

      var PatientAddress = oPatient.PatientAddress;
      var lineArray = [];
      if (PatientAddress.AddressLine1 != null) {
        lineArray.push(PatientAddress.AddressLine1);
      }
      if (PatientAddress.AddressLine2 != null) {
        lineArray.push(PatientAddress.AddressLine2);
      }
      if (PatientAddress.FormattedAddress != null) {
        var oAddress = oFhirDataType.GetAddressAustrlian(undefined, PatientAddress.FormattedAddress,
          lineArray, PatientAddress.Suburb, undefined, PatientAddress.Postcode);
        oPatientResource.SetAddress([oAddress]);
      }

      return oPatientResource;
    }

    function FhirPractitionerFactory(oPractitioner) {
      var oFhirTool = new FhirTools();
      var oFhirDataType = new FhirDataTypeTool();
      var oPractitionerResource = null;
      if (oPractitioner != null && oPractitioner.Family != null) {
        var oPractitionerResource = new PractitionerFhirResource();
        oPractitionerResource.SetId(oFhirTool.GetGuid());
        //MedicareProviderNumber      
        var oPractitionerIdentifierArray = [];
        if (oPractitioner.MedicareProviderNumber != null) {
          var oPractMedicareProviderNumberTypeCoding = oFhirDataType.GetCoding("UPIN", "http://terminology.hl7.org.au/CodeSystem/v2-0203", "Medicare Provider Number");
          var oPractMedicareProviderNumberType = oFhirDataType.GetCodeableConcept(oPractMedicareProviderNumberTypeCoding, undefined);
          var oPractMedicareProviderNumberIdentifier = oFhirDataType.GetIdentifier("official", oPractMedicareProviderNumberType,
            "http://ns.electronichealth.net.au/id/medicare-provider-number",
            oPractitioner.MedicareProviderNumber);
          oPractitionerIdentifierArray.push(oPractMedicareProviderNumberIdentifier);
          oPractitionerResource.SetIdentifierArray(oPractitionerIdentifierArray);
        }

        var oPractHumanName = oFhirDataType.GetHumanName("official", oPractitioner.FormattedName,
          oPractitioner.Family,
          oPractitioner.Given,
          oPractitioner.Title);
        oPractitionerResource.SetName([oPractHumanName]);
      }
      return oPractitionerResource;
    }

    function FhirProcedureRequestFactory(oPatientReference, oPractitionerReference) {
      var oFhirTool = new FhirTools();
      var oConstant = new Constants();
      var oProcedureRequestResource = new ProcedureRequestFhirResource();
      oProcedureRequestResource.SetId(oFhirTool.GetGuid());
      oProcedureRequestResource.SetMetaProfile([oConstant.fhirResourceProfile.icims.procedureRequest]);
      oProcedureRequestResource.SetStatus("active");
      oProcedureRequestResource.SetIntent("order");
      oProcedureRequestResource.SetSubject(oPatientReference);
      oProcedureRequestResource.SetRequester(oPractitionerReference, null);
      return oProcedureRequestResource;
    }

    function FhirDiagnosticReportFactory(oReport, SendingFacilityCode, SendingApplicationCode, oPatientResourceReference, oProcedureRequestResourceReference, oPractitionerResourceReference, oObservationResourceList, oFacilityConfig) {
      var oFhirTool = new FhirTools();
      var oFhirDataType = new FhirDataTypeTool();
      var oConstant = new Constants();
      var oDiagReport = new DiagnosticReportFhirResource();

      oDiagReport.SetId(oFhirTool.GetGuid());
      var XhtmlNarrative = null;
      if (SendingFacilityCode.toUpperCase() == oConstant.organization.dhm.name.toUpperCase()) {
        XhtmlNarrative = GetDiagnosticReportNarrative(oReport.DisplayDataLineList);
        var oNarrative = oFhirDataType.GetNarrative("additional", XhtmlNarrative)
        oDiagReport.SetText(oNarrative);
      } else if (oFacilityConfig.Implementation == ImplementationTypeEnum.CliniSearchRadiology) {
        //ToDo: Check we have the correct OBX and not just [0]
        XhtmlNarrative = GetDiagnosticReportNarrativeFromFT(oReport.ObservationList[0]);
        var oNarrative = oFhirDataType.GetNarrative("additional", XhtmlNarrative)
        oDiagReport.SetText(oNarrative);
      }

      oDiagReport.SetMetaProfile([oConstant.fhirResourceProfile.icims.diagnosticReport]);
      var oTypeCoding = oFhirDataType.GetCoding("FILL", "http://hl7.org/fhir/identifier-type", "Filler Identifier");
      var oType = oFhirDataType.GetCodeableConcept(oTypeCoding, "Report Identifier");

      var ReportIdentifier = null;
      if (SendingApplicationCode.toUpperCase() == oConstant.organization.sah.application.careZone.code.toUpperCase()) {
        ReportIdentifier = oFhirDataType.GetIdentifier("official", oType,
          oFhirTool.PreFixUuid(oConstant.organization.sah.application.epiSoft.codeSystem.FillerOrderNumber),
          oReport.FillerOrderNumberValue);
      } else if (SendingApplicationCode.toUpperCase() == oConstant.organization.sah.application.sanApps.code.toUpperCase()) {
        ReportIdentifier = oFhirDataType.GetIdentifier("official", oType,
          oFhirTool.PreFixUuid(oModels.DiagnosticReport.Report.FillerOrderNumberUniversalId.toLowerCase()),
          oReport.FillerOrderNumberValue);
      } else if (oFacilityConfig.Implementation == ImplementationTypeEnum.CliniSearchPathology) {
        if (SendingFacilityCode.toUpperCase() == oConstant.organization.dhm.name.toUpperCase()) {
          ReportIdentifier = oFhirDataType.GetIdentifier("official", oType,
            oConstant.organization.dhm.codeSystem.FillerOrderNumber,
            oReport.FillerOrderNumberValue);
        } else {
          throw new Error("Unable to resolve where the " + ImplementationTypeEnum.CliniSearchPathology + " message has come to format the FillerOrderNumber.");
        }
      } else if (oFacilityConfig.Implementation == ImplementationTypeEnum.CliniSearchRadiology) {
        ReportIdentifier = oFhirDataType.GetIdentifier("official", oType,
          oConstant.organization.sah.application.sanRad.codeSystem.FillerOrderNumber,
          oReport.FillerOrderNumberValue);
      } else {
        throw new Error("Unable to resolve where the message has come to format the FillerOrderNumber.");
      }

      oDiagReport.SetIdentifierArray([ReportIdentifier]);

      //This is the correct way to set the Requesting Practitioner
      if (oFacilityConfig.Implementation == ImplementationTypeEnum.CliniSearchPathology || oFacilityConfig.Implementation == ImplementationTypeEnum.CliniSearchRadiology) {
        if (oProcedureRequestResourceReference != null) {
          oDiagReport.AddBasedOn(oProcedureRequestResourceReference);
        }
      }

      oDiagReport.SetStatus(oReport.Status);

      var oCategoryCoding = oFhirDataType.GetCoding(oReport.DiagServSectId, "http://hl7.org/fhir/v2/0074");
      var oCategoryCodeableConcept = oFhirDataType.GetCodeableConcept(oCategoryCoding, "Diagnostic Service Section Codes");
      oDiagReport.SetCategory(oCategoryCodeableConcept);

      var oCodeCoding = null;
      if (oFacilityConfig.Implementation == ImplementationTypeEnum.CliniSearchPathology && SendingFacilityCode.toUpperCase() == oConstant.organization.dhm.name.toUpperCase()) {
        oCodeCoding = oFhirDataType.GetCoding(oReport.ReportCode, oConstant.organization.dhm.codeSystem.ReportPanel, oReport.ReportCodeDescription);
      } else if (oFacilityConfig.Implementation == ImplementationTypeEnum.CliniSearchRadiology) {
        oCodeCoding = oFhirDataType.GetCoding(oReport.ReportCode, oConstant.organization.sah.application.sanRad.codeSystem.ReportPanel, oReport.ReportCodeDescription);
      } else {
        if (oReport.ReportCode == null && oReport.ReportCodeDescription != null) {
          oCodeCoding = oFhirDataType.GetCoding(undefined, undefined, oReport.ReportCodeDescription);
        } else {
          oCodeCoding = oFhirDataType.GetCoding(oReport.ReportCode, "http://loinc.org", oReport.ReportCodeDescription);
        }
      }

      var oCodeCodeableConcept = oFhirDataType.GetCodeableConcept(oCodeCoding);
      oDiagReport.SetCode(oCodeCodeableConcept);
      oDiagReport.SetSubject(oPatientResourceReference);

      oDiagReport.SetEffectiveDateTime(oFhirTool.FhirDateTimeFormat(oReport.CollectionDateTime.AsXML));
      oDiagReport.SetIssued(oFhirTool.FhirDateTimeFormat(oReport.ReportIssuedDateTime.AsXML));

      //Add Performer Practitioner which is incorrect if this is a Requesting Practitioner   
      if (oFacilityConfig.Implementation != ImplementationTypeEnum.CliniSearchRadiology) {
        if (oFacilityConfig.Implementation != ImplementationTypeEnum.CliniSearchPathology) {
          if (oPractitionerResourceReference != null) {
            var oPerformerRoleCodeableConcept = undefined;
            if (SendingApplicationCode.toUpperCase() == oConstant.organization.sah.application.careZone.code.toUpperCase()) {
              var oPerformerRoleCoding = oFhirDataType.GetCoding("310512001", "http://snomed.info/sct", "Medical oncologist");
              oPerformerRoleCodeableConcept = oFhirDataType.GetCodeableConcept(oPerformerRoleCoding, undefined);
            }
            oDiagReport.AddPerformer(oPerformerRoleCodeableConcept, oPractitionerResourceReference);
          }
        }
      }

      //Add All the DiagnosticReportObservationResourceList References to the DiagnosticReport Resource
      var ResultReferenceArray = [];
      for (var i = 0; (i < oObservationResourceList.length); i++) {
        var oObsReference = oFhirDataType.GetReference("Observation", oObservationResourceList[i].id, oObservationResourceList[i].code.coding.display);
        ResultReferenceArray.push(oObsReference);
      }
      if (ResultReferenceArray.length > 0) {
        oDiagReport.SetResult(ResultReferenceArray);
      }

      // //Get the base64 encoded PDF from the ObservationList and add to the DiagnosticReport Resource
      // //property named 'presentedForm'
      // if (oModels.FacilityConfig.SendPathologyPdfReport) {
      //   for (var i = 0; (i < oModels.DiagnosticReport.ObservationList.length); i++) {
      //     if (oV2Obs.Code == "PDF" && oV2Obs.CodeSystem == "AUSPDI") {
      //       var oPdfAttachment = oFhirDataType.GetPdfAttachment(oV2Obs.Value);
      //       oDiagReport.SetPresentedForm([oPdfAttachment]);
      //       break;
      //     }
      //   }
      // }
      return oDiagReport
    }

    function FhirObservationFactory(oObservationList, oReportIssuedDateTime, oPatientResourceReference, oFacilityConfig) {
      var oFhirTool = new FhirTools();
      var oFhirDataType = new FhirDataTypeTool();
      var oConstant = new Constants();
      var oArraySupport = new ArraySupport();

      var oDiagnosticReportLogical = {
        DiagnosticReportResource: null,
        OrderingPractitionerResource: null,
        ProcedureRequestResource: null,
        ObservationResourceList: [],
        SubObservationResourceList: []
      }

      var SubIdProcessedArray = [];
      for (var o = 0; (o < oObservationList.length); o++) {
        var oObservation = oObservationList[o];

        if (oFacilityConfig.Implementation == ImplementationTypeEnum.CliniSearchPathology) {
          var ObsCategoryCoding = oFhirDataType.GetCoding("laboratory", "http://hl7.org/fhir/observation-category", "Laboratory");
        } else if (oFacilityConfig.Implementation == ImplementationTypeEnum.CliniSearchRadiology) {
          var ObsCategoryCoding = oFhirDataType.GetCoding("RAD", "http://hl7.org/fhir/observation-category", "Radiology");
        } else {
          var ObsCategoryCoding = oFhirDataType.GetCoding("procedure", "http://hl7.org/fhir/observation-category", "Procedure");
        }
        var ObsCategoryCodeableConcept = oFhirDataType.GetCodeableConcept(ObsCategoryCoding);

        if (oObservation.Code != "PDF" && oObservation.CodeSystem != "AUSPDI") {
          if (oObservation.SubId == null) {
            var oObservationResource = FhirObsFactory(oObservation,
              oReportIssuedDateTime.AsXML,
              oPatientResourceReference,
              ObsCategoryCodeableConcept,
              oConstant.fhirResourceProfile.icims.observation);
            oDiagnosticReportLogical.ObservationResourceList.push(oObservationResource);
          } else {
            if (!oArraySupport.Contains(SubIdProcessedArray, oObservation.SubId)) {
              var oParentObservation = new ObservationFhirResource();
              oParentObservation.SetId(oFhirTool.GetGuid());
              var ObsCodeCoding = oFhirDataType.GetCoding(oObservation.SubId,
                "https://www.sah.org.au/systems/fhir/observation/procedure-observation", oObservation.SubId);
              var ObsCodeCodeableConcept = oFhirDataType.GetCodeableConcept(ObsCodeCoding);
              oParentObservation.SetCode(ObsCodeCodeableConcept);
              oParentObservation.SetSubject(oPatientResourceReference);
              var oSubIdObsGroup = oArraySupport.Filter(oObservationList, "SubId", oObservation.SubId);
              oDiagnosticReportLogical.ObservationResourceList.push(oParentObservation);
              for (var x = 0; (x < oSubIdObsGroup.length); x++) {
                var oSubObs = oSubIdObsGroup[x];
                var oSubObservation = FhirObsFactory(oSubObs,
                  oReportIssuedDateTime.AsXML,
                  oPatientResourceReference,
                  ObsCategoryCodeableConcept,
                  oConstant.fhirResourceProfile.icims.observation);
                var oSubObservationReference = oFhirDataType.GetReference("Observation", oSubObservation.id, undefined);
                oParentObservation.AddRelated(oSubObservationReference, "has-member");
                oDiagnosticReportLogical.SubObservationResourceList.push(oSubObservation);
              }
              SubIdProcessedArray.push(oObservation.SubId);
            }
          }
        }
      }
      return oDiagnosticReportLogical;
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
        if (oV2Obs.CodeSystem != null && oV2Obs.CodeSystem.toUpperCase() == "LN") {
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
        oObservation.SetEffectiveDateTime(oFhirTool.FhirDateTimeFormat(ReportIssuedDateTime));
        //Time off analyser, when the observation was observerd
        if (oV2Obs.ObsDateTime != null) {
          oObservation.SetIssued(oFhirTool.FhirDateTimeFormat(oV2Obs.ObsDateTime.AsXML));
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

    function FhirOrganizationFactory(ResourceId, OrganizationName, OrganizationAliasNameList) {
      var oConstant = new Constants();
      var oOrg = new OrganizationFhirResource();
      oOrg.SetId(ResourceId);
      oOrg.SetMetaProfile(["http://hl7.org.au/fhir/StructureDefinition/au-organisation", oConstant.fhirResourceProfile.icims.organization]);
      oOrg.SetName(OrganizationName);
      oOrg.SetAlias(OrganizationAliasNameList);
      return oOrg;
    }

    function FhirProvenanceFactory(oBundleLogical, MessageControlID, oFacilityConfig) {
      var oFhirTool = new FhirTools();
      var oFhirDataType = new FhirDataTypeTool();
      var oConstant = new Constants();

      var oProvenance = new ProvenanceFhirResource();
      oProvenance.SetId(oFhirTool.GetGuid());
      oProvenance.SetMetaProfile([oConstant.fhirResourceProfile.icims.provenance]);

      var TargetReferenceArray = [];
      TargetReferenceArray.push(oFhirDataType.GetReference("MessageHeader", oBundleLogical.MessageHeaderResource.id, "MessageHeader"));
      TargetReferenceArray.push(oFhirDataType.GetReference("Patient", oBundleLogical.PatientResource.id, "Patient"));
      for (var i = 0; (i < oBundleLogical.DiagnosticReportLogicalList.length); i++) {
        var DiagnosticReportLogical = oBundleLogical.DiagnosticReportLogicalList[i];
        TargetReferenceArray.push(oFhirDataType.GetReference("DiagnosticReport", DiagnosticReportLogical.DiagnosticReportResource.id, "DiagnosticReport"));

        if (DiagnosticReportLogical.OrderingPractitionerResource != null) {
          TargetReferenceArray.push(oFhirDataType.GetReference("Practitioner", DiagnosticReportLogical.OrderingPractitionerResource.id, "Practitioner"));
        }

        if (DiagnosticReportLogical.ProcedureRequestResource != null) {
          TargetReferenceArray.push(oFhirDataType.GetReference("ProcedureRequest", DiagnosticReportLogical.ProcedureRequestResource.id, "ProcedureRequest"));
        }

        for (var i = 0; (i < DiagnosticReportLogical.ObservationResourceList.length); i++) {
          TargetReferenceArray.push(oFhirDataType.GetReference("Observation", DiagnosticReportLogical.ObservationResourceList[i].id, "Observation"));
        }
      }

      for (var i = 0; (i < oBundleLogical.OrganizationResourceList.length); i++) {
        TargetReferenceArray.push(oFhirDataType.GetReference("Organization", oBundleLogical.OrganizationResourceList[i].id, "Organization " + oBundleLogical.OrganizationResourceList[i].name));
      }

      oProvenance.SetTarget(TargetReferenceArray);

      var Today = oFhirTool.GetNow();

      oProvenance.SetRecorded(Today);

      var activityCoding = oFhirDataType.GetCoding("CREATE", "http://hl7.org/fhir/v3/DataOperation", "create");
      oProvenance.SetActivity(activityCoding);

      var whoReference = oFhirDataType.GetReference(undefined, undefined, "HL7 Connect Integration Engine");
      var onBehalfOfReference = oFhirDataType.GetReference("Organization", oConstant.organization.icims.id, oConstant.organization.icims.name);
      oProvenance.SetAgent(undefined, whoReference, onBehalfOfReference);

      var messageControlIdIdentifier = null;
      if (oFacilityConfig.Implementation == ImplementationTypeEnum.CliniSearchPathology) {
        messageControlIdIdentifier = oFhirDataType.GetIdentifier("official", undefined,
          oConstant.organization.dhm.codeSystem.messageControlId, MessageControlID);

      } else if (oFacilityConfig.Implementation == ImplementationTypeEnum.CliniSearchRadiology) {
        messageControlIdIdentifier = oFhirDataType.GetIdentifier("official", undefined,
          oConstant.organization.sah.application.sanRad.codeSystem.messageControlId, MessageControlID);
      } else {
        messageControlIdIdentifier = oFhirDataType.GetIdentifier("official", undefined,
          oConstant.organization.sah.application.sanApps.codeSystem.messageControlId, MessageControlID);
      }
      oProvenance.SetEntity("source", messageControlIdIdentifier);

      return oProvenance;
    }

    function FhirBundleFactory(oBundleLogical) {
      BreakPoint;
      var oFhirTool = new FhirTools();
      var oConstant = new Constants();
      //When sending to a [base]/fhir/Bundle endpoint for testing as a POST
      //you can not have an id, however, when sending to $process-message you must
      var oBundle = new BundleFhirResource();
      oBundle.SetId(oFhirTool.GetGuid());
      oBundle.SetType("message");
      oBundle.SetMetaProfile([oConstant.fhirResourceProfile.icims.messageBundle]);

      //Add MessageHeader to Bundle
      if (oBundleLogical.MessageHeaderResource != null) {
        oBundle.AddEntry(oFhirTool.PreFixUuid(oBundleLogical.MessageHeaderResource.id), oBundleLogical.MessageHeaderResource);
      }

      //DiagnosticReports
      for (var i = 0; (i < oBundleLogical.DiagnosticReportLogicalList.length); i++) {

        //Add DiagnosticReport to Bundle
        oBundle.AddEntry(oFhirTool.PreFixUuid(oBundleLogical.DiagnosticReportLogicalList[i].DiagnosticReportResource.id), oBundleLogical.DiagnosticReportLogicalList[i].DiagnosticReportResource);

        //Add Practitioner to Bundle
        if (oBundleLogical.DiagnosticReportLogicalList[i].OrderingPractitionerResource != null) {
          oBundle.AddEntry(oFhirTool.PreFixUuid(oBundleLogical.DiagnosticReportLogicalList[i].OrderingPractitionerResource.id), oBundleLogical.DiagnosticReportLogicalList[i].OrderingPractitionerResource);
        }

        //Add ProcedureRequest to Bundle  
        if (oBundleLogical.DiagnosticReportLogicalList[i].ProcedureRequestResource != null) {
          oBundle.AddEntry(oFhirTool.PreFixUuid(oBundleLogical.DiagnosticReportLogicalList[i].ProcedureRequestResource.id), oBundleLogical.DiagnosticReportLogicalList[i].ProcedureRequestResource);
        }

        //Add Observations to Bundle
        for (var o = 0; (o < oBundleLogical.DiagnosticReportLogicalList[i].ObservationResourceList.length); o++) {
          oBundle.AddEntry(oFhirTool.PreFixUuid(oBundleLogical.DiagnosticReportLogicalList[i].ObservationResourceList[o].id), oBundleLogical.DiagnosticReportLogicalList[i].ObservationResourceList[o]);
        }

        //Add Sub-Observations to Bundle
        for (var s = 0; (s < oBundleLogical.DiagnosticReportLogicalList[i].SubObservationResourceList.length); s++) {
          oBundle.AddEntry(oFhirTool.PreFixUuid(oBundleLogical.DiagnosticReportLogicalList[i].SubObservationResourceList[s].id), oBundleLogical.DiagnosticReportLogicalList[i].SubObservationResourceList[s]);
        }

      }

      //Add Patient to Bundle
      if (oBundleLogical.PatientResource != null) {
        oBundle.AddEntry(oFhirTool.PreFixUuid(oBundleLogical.PatientResource.id), oBundleLogical.PatientResource);
      }

      //Add Organizations to Bundle
      for (var i = 0; (i < oBundleLogical.OrganizationResourceList.length); i++) {
        oBundle.AddEntry(oFhirTool.PreFixUuid(oBundleLogical.OrganizationResourceList[i].id), oBundleLogical.OrganizationResourceList[i]);
      }

      //Add Provenance to Bundle
      if (oBundleLogical.ProvenanceResource != null) {
        oBundle.AddEntry(oFhirTool.PreFixUuid(oBundleLogical.ProvenanceResource.id), oBundleLogical.ProvenanceResource);
      }

      return oBundle;
    }

    function GetDiagnosticReportNarrative(DisplayLineList) {
      var oStringSupport = new StringSupport();
      var output = "<div xmlns=\"http://www.w3.org/1999/xhtml\">\n  <pre>"
      for (var i = 0; (i < DisplayLineList.length); i++) {
        output = output + oStringSupport.XMLEscape(DisplayLineList[i]) + "\n";
      }
      output = output + "  </pre>\n</div>";
      return output;
    }

    function GetDiagnosticReportNarrativeFromFT(FormattedText) {
      var oStringSupport = new StringSupport();
      var output = "<div xmlns=\"http://www.w3.org/1999/xhtml\">\n  <pre>"
      var BRSplit = FormattedText.split("\\.br\\");
      for (var i = 0; (i < BRSplit.length); i++) {
        output = output + oStringSupport.XMLEscape(BRSplit[i]) + "\n";
      }
      output = output + "  </pre>\n</div>";
      return output;
    }

  }