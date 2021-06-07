
<% include $newserver$\FhirLibrary\STU3\Resource.js %>
<% include $newserver$\FhirLibrary\STU3\DomainResource.js %>
<% include $newserver$\FhirLibrary\STU3\BundleFhirResource.js %>
<% include $newserver$\FhirLibrary\STU3\MessageHeaderFhirResource.js %>
<% include $newserver$\FhirLibrary\STU3\OrganizationFhirResource.js %>
<% include $newserver$\FhirLibrary\STU3\DiagnosticReportFhirResource.js %>
<% include $newserver$\FhirLibrary\STU3\PatientFhirResource.js %>
<% include $newserver$\FhirLibrary\STU3\ObservationFhirResource.js %>
<% include $newserver$\FhirLibrary\STU3\ProvenanceFhirResource.js %>
<% include $newserver$\FhirLibrary\STU3\PractitionerFhirResource.js %>
<% include $newserver$\FhirLibrary\STU3\ProcedureRequestFhirResource.js %>
<% include $newserver$\FhirLibrary\STU3\FhirDataTypeTool.js %>
<% include $newserver$\FhirLibrary\STU3\FhirTools.js %>
<% include $newserver$\FhirLibrary\STU3\FhirConstants.js %>
<% include $newserver$\ICIMS\Constants.js %>


  function FhirResourceFactory() {

    this.CreateDiagnosticReportBundle = function (oModels) {
      return new CreateDiagnosticReportBundle(oModels);
    };

    function CreateDiagnosticReportBundle(oModels) {

      var oFhirDataType = new FhirDataTypeTool();
      var oConstant = new Constants();
      var oFhirConstants = new FhirConstants();

      BreakPoint;

      var BundleLogical = {
        MessageHeaderResource: null,
        PatientResource: null,
        OrganizationResourceList: [],
        PractitionerResourceList: [],
        DiagnosticReportLogicalList: [],
        ProvenanceResource: null
      }


      //MessageHeader Resource      
      BundleLogical.MessageHeaderResource = FhirMessageHeaderFactory(oModels.DiagnosticReport.Meta, oModels.FacilityConfig);

      //Patient Resource     
      BundleLogical.PatientResource = FhirPatientFactory(oModels.DiagnosticReport.Patient, oModels.FacilityConfig);
      var oPatientResourceReference = oFhirDataType.GetReference(oFhirConstants.ResourceName.Patient, BundleLogical.PatientResource.id, oModels.DiagnosticReport.Patient.FormattedName);
      //========================================================================================================

      for (var r = 0; (r < oModels.DiagnosticReport.ReportList.length); r++) {
        var CurrentReport = oModels.DiagnosticReport.ReportList[r];

        var DiagnosticReportLogical = {
          DiagnosticReportResource: null,
          OrderingPractitionerResourceReference: null,
          PrincipalResultInterpreterPractitionerResourceReference: null,
          ProcedureRequestResource: null,
          ObservationResourceList: [],
          SubObservationResourceList: []
        }

        //Observation Resource       
        if (oModels.FacilityConfig.Implementation != ImplementationTypeEnum.CLINISEARCHPATHOLOGY) {
          if (oModels.FacilityConfig.Implementation != ImplementationTypeEnum.CLINISEARCHRADIOLOGY) {
            var DiagnosticReportLogical = FhirObservationFactory(CurrentReport.ObservationList, CurrentReport.ReportIssuedDateTime, oPatientResourceReference, oModels.FacilityConfig);
          }
        }

        //OrderingPractitioner Resource            
        var oTargetOrderingPractitionerResource = FindPractitionerResourceIdByIdentifier(BundleLogical.PractitionerResourceList, CurrentReport.OrderingPractitioner.Identifier, oConstant.organization.servicesAustralia.codeSystem.medicareProviderNumber);
        if (oTargetOrderingPractitionerResource == null) {
          //Both Agfa and Karisma at the SAM provide a Medicare Provider Number for the Ordering Provider (OBR-16)
          //However, Agfa does not provide an AssigningAuthority code (i.e AUSHICPR) to tell us this fact whereas Karisma does,
          //So this code is weak because we are just assuming they are providing a Medicare Provider number 
          oTargetOrderingPractitionerResource = FhirPractitionerFactory(CurrentReport.OrderingPractitioner, oConstant.organization.servicesAustralia.codeSystem.medicareProviderNumber);
          if (oTargetOrderingPractitionerResource != null) {
            BundleLogical.PractitionerResourceList.push(oTargetOrderingPractitionerResource);
          }
        }
        if (oTargetOrderingPractitionerResource != null) {
          DiagnosticReportLogical.OrderingPractitionerResourceReference = oFhirDataType.GetReference(oFhirConstants.ResourceName.Practitioner, oTargetOrderingPractitionerResource.id, "Ordering Practitioner:" + CurrentReport.OrderingPractitioner.FormattedName);
        }

        //PrincipalResultInterpreter Practitioner Resource        
        //Note that we had a message from the AGFA system which had no PrincipalResultInterpreter, many othr do have it though.
        if (CurrentReport.PrincipalResultInterpreter != null) {
          var oTargetPrincipalResultInterpreterPractitionerResource = null
          //For the PrincipalResultInterpreter we also do not get an AssigningAuthority to detect a Medicare Provider number so again we are making assumptions based on the messages seen 
          //For Agfa we appear to get a Medicare Provider number, yet for Karisma we only get a local code.
          //Also note that we are only adding a PrincipalResultInterpreterPractitionerResource for Radiology and not Pathology or the other Theatre or CareZone bundles
          if (oModels.DiagnosticReport.Meta.SendingFacility.toUpperCase() == oConstant.organization.sah.application.sanRad.sendingFacilityCode.toUpperCase()) {
            //Check we have not already generated a PractitionerResource for this Practitioner
            oTargetPrincipalResultInterpreterPractitionerResource = FindPractitionerResourceIdByIdentifier(BundleLogical.PractitionerResourceList, CurrentReport.PrincipalResultInterpreter.Identifier, oConstant.organization.servicesAustralia.codeSystem.medicareProviderNumber);
            if (oTargetPrincipalResultInterpreterPractitionerResource == null) {
              oTargetPrincipalResultInterpreterPractitionerResource = FhirPractitionerFactory(CurrentReport.PrincipalResultInterpreter, oConstant.organization.servicesAustralia.codeSystem.medicareProviderNumber);
              BundleLogical.PractitionerResourceList.push(oTargetPrincipalResultInterpreterPractitionerResource);
            }
          } else if (oModels.DiagnosticReport.Meta.SendingFacility.toUpperCase() == oConstant.organization.sah.application.sanUSForWomen.sendingFacilityCode.toUpperCase()) {
            //Check we have not already generated a PractitionerResource for this Practitioner
            oTargetPrincipalResultInterpreterPractitionerResource = FindPractitionerResourceIdByIdentifier(BundleLogical.PractitionerResourceList, CurrentReport.PrincipalResultInterpreter.Identifier, oConstant.organization.sah.application.sanUSForWomen.codeSystem.provider);
            if (oTargetPrincipalResultInterpreterPractitionerResource == null) {
              oTargetPrincipalResultInterpreterPractitionerResource = FhirPractitionerFactory(CurrentReport.PrincipalResultInterpreter, oConstant.organization.sah.application.sanUSForWomen.codeSystem.provider);
              BundleLogical.PractitionerResourceList.push(oTargetPrincipalResultInterpreterPractitionerResource);
            }
          }

          if (oTargetPrincipalResultInterpreterPractitionerResource != null) {
            DiagnosticReportLogical.PrincipalResultInterpreterPractitionerResourceReference = oFhirDataType.GetReference(oFhirConstants.ResourceName.Practitioner, oTargetPrincipalResultInterpreterPractitionerResource.id, "Principal Result Interpreter: " + CurrentReport.PrincipalResultInterpreter.FormattedName);
          }
        }

        //ProcedureRequest Resource
        var oProcedureRequestResourceReference = null;
        if (oModels.FacilityConfig.Implementation == ImplementationTypeEnum.CLINISEARCHPATHOLOGY || oModels.FacilityConfig.Implementation == ImplementationTypeEnum.CLINISEARCHRADIOLOGY) {
          DiagnosticReportLogical.ProcedureRequestResource = FhirProcedureRequestFactory(oPatientResourceReference, DiagnosticReportLogical.OrderingPractitionerResourceReference);
          var oProcedureRequestResourceReference = oFhirDataType.GetReference(oFhirConstants.ResourceName.ProcedureRequest, DiagnosticReportLogical.ProcedureRequestResource.id, oFhirConstants.ResourceName.ProcedureRequest);
        }
        //DiagnosticReport Resource       
        DiagnosticReportLogical.DiagnosticReportResource = FhirDiagnosticReportFactory(CurrentReport, oModels.DiagnosticReport.Meta.SendingFacility, oModels.DiagnosticReport.Meta.SendingApplication, oPatientResourceReference, oProcedureRequestResourceReference, DiagnosticReportLogical.OrderingPractitionerResourceReference, DiagnosticReportLogical.PrincipalResultInterpreterPractitionerResourceReference, DiagnosticReportLogical.ObservationResourceList, oModels.FacilityConfig);
        BundleLogical.DiagnosticReportLogicalList.push(DiagnosticReportLogical);

      }

      BreakPoint;
      var FocusReferenceArray = [];
      for (var k = 0; (k < BundleLogical.DiagnosticReportLogicalList.length); k++) {
        FocusReferenceArray.push(oFhirDataType.GetReference(oFhirConstants.ResourceName.DiagnosticReport, BundleLogical.DiagnosticReportLogicalList[k].DiagnosticReportResource.id, oFhirConstants.ResourceName.DiagnosticReport));
      }
      BundleLogical.MessageHeaderResource.SetFocus(FocusReferenceArray);

      //Icims Organization Resource
      BundleLogical.OrganizationResourceList.push(FhirOrganizationFactory(oConstant.organization.icims.id, oConstant.organization.icims.name, oConstant.organization.icims.aliasList));
      if (oModels.FacilityConfig.Implementation == ImplementationTypeEnum.CLINISEARCHPATHOLOGY) {
        //DHM Organization Resource
        BundleLogical.OrganizationResourceList.push(FhirOrganizationFactory(oConstant.organization.dhm.id, oConstant.organization.dhm.name, oConstant.organization.dhm.aliasList));
      } else {
        //SAH Organization Resource
        BundleLogical.OrganizationResourceList.push(FhirOrganizationFactory(oConstant.organization.sah.id, oConstant.organization.sah.name, oConstant.organization.sah.aliasList));
      }

      //Provenance Resource
      BundleLogical.ProvenanceResource = FhirProvenanceFactory(BundleLogical, oModels.DiagnosticReport.Meta.MessageControlID, oModels.FacilityConfig);

      //Bundle Resource
      var oBundle = FhirBundleFactory(BundleLogical);

      return oBundle;
    }

    function FhirMessageHeaderFactory(oMeta, oFacilityConfig) {
      var oConstant = new Constants();
      var oFhirConstants = new FhirConstants();
      var oFhirDataType = new FhirDataTypeTool();
      var oFhirTool = new FhirTools();

      var oMsgHeader = new MessageHeaderFhirResource();
      oMsgHeader.SetId(oMeta.MessageControlID);
      oMsgHeader.SetMetaProfile([oConstant.fhirResourceProfile.icims.messageHeader]);
      var HeaderEventCoding = oFhirDataType.GetCoding("diagnosticreport-provide", "http://hl7.org/fhir/message-events", "diagnosticreport-provide");
      oMsgHeader.SetEvent(HeaderEventCoding);
      if (oFacilityConfig.Implementation == ImplementationTypeEnum.CLINISEARCHPATHOLOGY || oFacilityConfig.Implementation == ImplementationTypeEnum.CLINISEARCHRADIOLOGY) {
        oMsgHeader.SetDestination(oConstant.organization.sah.application.cliniSearch.code, undefined, oFacilityConfig.EndPoint);
      } else {
        oMsgHeader.SetDestination(oConstant.organization.icims.name, undefined, oFacilityConfig.EndPoint);
      }
      oMsgHeader.SetTimestamp(oFhirTool.FhirDateTimeFormat(oMeta.MessageDateTime.AsXML));
      var oReceiverReference = oFhirDataType.GetReference(oFhirConstants.ResourceName.Organization, oConstant.organization.icims.id, oConstant.organization.icims.name);
      oMsgHeader.SetReceiver(oReceiverReference);
      var oSenderReference = null;
      if (oFacilityConfig.Implementation == ImplementationTypeEnum.CLINISEARCHPATHOLOGY) {
        oSenderReference = oFhirDataType.GetReference(oFhirConstants.ResourceName.Organization, oConstant.organization.dhm.id, oConstant.organization.dhm.name);
      } else {
        oSenderReference = oFhirDataType.GetReference(oFhirConstants.ResourceName.Organization, oConstant.organization.sah.id, oConstant.organization.sah.name);
      }
      oMsgHeader.SetSender(oSenderReference);
      oMsgHeader.SetSource(oMeta.SendingApplication);
      var messageheaderResponseRequestExtension = oFhirDataType.GetExtension("http://hl7.org/fhir/StructureDefinition/messageheader-response-request", "valueCode", "on-error");
      oMsgHeader.SetExtension(messageheaderResponseRequestExtension);

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

    function FhirPractitionerFactory(oPractitioner, IdentifierSystem) {
      var oFhirTool = new FhirTools();
      var oConstant = new Constants();
      var oFhirDataType = new FhirDataTypeTool();

      var oPractitionerResource = null;
      if (oPractitioner != null && oPractitioner.Family != null) {
        var oPractitionerResource = new PractitionerFhirResource();
        oPractitionerResource.SetMetaProfile([oConstant.fhirResourceProfile.icims.Practitioner]);
        oPractitionerResource.SetId(oFhirTool.GetGuid());
        //MedicareProviderNumber      
        var oPractitionerIdentifierArray = [];
        if (oPractitioner.Identifier != null && IdentifierSystem === oConstant.organization.servicesAustralia.codeSystem.medicareProviderNumber) {
          var oPractMedicareProviderNumberTypeCoding = oFhirDataType.GetCoding("UPIN", "http://terminology.hl7.org.au/CodeSystem/v2-0203", "Medicare Provider Number");
          var oPractMedicareProviderNumberType = oFhirDataType.GetCodeableConcept(oPractMedicareProviderNumberTypeCoding, undefined);
          var oPractMedicareProviderNumberIdentifier = oFhirDataType.GetIdentifier("official", oPractMedicareProviderNumberType,
            oConstant.organization.servicesAustralia.codeSystem.medicareProviderNumber,
            oPractitioner.Identifier);
          oPractitionerIdentifierArray.push(oPractMedicareProviderNumberIdentifier);
        } else {
          //Some other local Id with its system
          var oLocalIdIdentifier = oFhirDataType.GetIdentifier("official", undefined,
            IdentifierSystem,
            oPractitioner.Identifier);
          oPractitionerIdentifierArray.push(oLocalIdIdentifier);
        }

        if (oPractitionerIdentifierArray.length > 0) {
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

    function FhirDiagnosticReportFactory(oReport, SendingFacilityCode, SendingApplicationCode, oPatientResourceReference, oProcedureRequestResourceReference, oOrderingPractitionerResourceReference, oPrincipalResultInterpreterResourceReference, oObservationResourceList, oFacilityConfig) {
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
      } else if (oFacilityConfig.Implementation == ImplementationTypeEnum.CLINISEARCHRADIOLOGY) {
        //ToDo: Check we have the correct OBX and not just [0]
        if (oReport.ObservationList != null || oReport.ObservationList.length != 0) {
          XhtmlNarrative = GetDiagnosticReportNarrativeFromFT(oReport.ObservationList[oReport.ObservationList.length - 1].Value);
          var oNarrative = oFhirDataType.GetNarrative("additional", XhtmlNarrative)
          oDiagReport.SetText(oNarrative);
        } else {
          throw new Error("Unable to locate OBX segments under the " + ImplementationTypeEnum.CLINISEARCHRADIOLOGY + " messages' OBR segment.");
        }
      }

      BreakPoint;
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
          oFhirTool.PreFixUuid(oReport.FillerOrderNumberUniversalId.toLowerCase()),
          oReport.FillerOrderNumberValue);
      } else if (oFacilityConfig.Implementation == ImplementationTypeEnum.CLINISEARCHPATHOLOGY) {
        if (SendingFacilityCode.toUpperCase() == oConstant.organization.dhm.name.toUpperCase()) {
          ReportIdentifier = oFhirDataType.GetIdentifier("official", oType,
            oConstant.organization.dhm.codeSystem.FillerOrderNumber,
            oReport.FillerOrderNumberValue);
        } else {
          throw new Error("Unable to resolve where the " + ImplementationTypeEnum.CLINISEARCHPATHOLOGY + " message has come to format the FillerOrderNumber.");
        }
      } else if (oFacilityConfig.Implementation == ImplementationTypeEnum.CLINISEARCHRADIOLOGY) {
        if (SendingFacilityCode.toUpperCase() == oConstant.organization.sah.application.sanUSForWomen.sendingFacilityCode.toUpperCase()) {
          ReportIdentifier = oFhirDataType.GetIdentifier("official", oType,
            oConstant.organization.sah.application.sanUSForWomen.codeSystem.FillerOrderNumber,
            oReport.FillerOrderNumberValue);
        } else if (SendingFacilityCode.toUpperCase() == oConstant.organization.sah.application.sanRad.sendingFacilityCode.toUpperCase()) {
          ReportIdentifier = oFhirDataType.GetIdentifier("official", oType,
            oConstant.organization.sah.application.sanRad.codeSystem.FillerOrderNumber,
            oReport.FillerOrderNumberValue);
        } else {
          throw new Error("Unable to resolve where the CLINISEARCHRADIOLOGY message has come to format the FillerOrderNumber.");
        }
      } else {
        throw new Error("Unable to resolve where the message has come to format the FillerOrderNumber.");
      }

      oDiagReport.SetIdentifierArray([ReportIdentifier]);

      //This is the correct way to set the Requesting Practitioner
      if (oFacilityConfig.Implementation == ImplementationTypeEnum.CLINISEARCHPATHOLOGY || oFacilityConfig.Implementation == ImplementationTypeEnum.CLINISEARCHRADIOLOGY) {
        if (oProcedureRequestResourceReference != null) {
          oDiagReport.AddBasedOn(oProcedureRequestResourceReference);
        }
      }

      oDiagReport.SetStatus(oReport.Status);

      var oCategoryCoding = oFhirDataType.GetCoding(oReport.DiagServSectId, "http://hl7.org/fhir/v2/0074");
      var oCategoryCodeableConcept = oFhirDataType.GetCodeableConcept(oCategoryCoding, "Diagnostic Service Section Codes");
      oDiagReport.SetCategory(oCategoryCodeableConcept);

      var oCodeCoding = null;
      if (oFacilityConfig.Implementation == ImplementationTypeEnum.CLINISEARCHPATHOLOGY && SendingFacilityCode.toUpperCase() == oConstant.organization.dhm.name.toUpperCase()) {
        oCodeCoding = oFhirDataType.GetCoding(oReport.ReportCode, oConstant.organization.dhm.codeSystem.ReportPanel, oReport.ReportCodeDescription);
      } else if (oFacilityConfig.Implementation == ImplementationTypeEnum.CLINISEARCHRADIOLOGY) {
        if (SendingFacilityCode.toUpperCase() == oConstant.organization.sah.application.sanUSForWomen.sendingFacilityCode.toUpperCase()) {
          oCodeCoding = oFhirDataType.GetCoding(oReport.ReportCode, oConstant.organization.sah.application.sanUSForWomen.codeSystem.ReportPanel, oReport.ReportCodeDescription);
        } else if (SendingFacilityCode.toUpperCase() == oConstant.organization.sah.application.sanRad.sendingFacilityCode.toUpperCase()) {
          oCodeCoding = oFhirDataType.GetCoding(oReport.ReportCode, oConstant.organization.sah.application.sanRad.codeSystem.ReportPanel, oReport.ReportCodeDescription);
        } else {
          throw new Error("Unable to determine the correct ReportPanel system for the SendingFacilityCode of " + SendingFacilityCode);
        }
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
      if (oFacilityConfig.Implementation != ImplementationTypeEnum.CLINISEARCHRADIOLOGY) {
        if (oFacilityConfig.Implementation != ImplementationTypeEnum.CLINISEARCHPATHOLOGY) {
          if (oOrderingPractitionerResourceReference != null) {
            var oOrderingPerformerRoleCodeableConcept = undefined;
            if (SendingApplicationCode.toUpperCase() == oConstant.organization.sah.application.careZone.code.toUpperCase()) {
              var oOrderingPerformerRoleCoding = oFhirDataType.GetCoding("310512001", "http://snomed.info/sct", "Medical oncologist");
              oOrderingPerformerRoleCodeableConcept = oFhirDataType.GetCodeableConcept(oOrderingPerformerRoleCoding, undefined);
            }
            oDiagReport.AddPerformer(oOrderingPerformerRoleCodeableConcept, oOrderingPractitionerResourceReference);
          }
        }
      }

      BreakPoint;
      if (oFacilityConfig.Implementation == ImplementationTypeEnum.CLINISEARCHRADIOLOGY && oPrincipalResultInterpreterResourceReference != null) {
        var oResultInterpreterPerformerRoleCoding = oFhirDataType.GetCoding("78729002", "http://snomed.info/sct", "Diagnostic radiologist");
        var oResultInterpreterPerformerRoleCodeableConcept = oFhirDataType.GetCodeableConcept(oResultInterpreterPerformerRoleCoding, undefined);
        oDiagReport.AddPerformer(oResultInterpreterPerformerRoleCodeableConcept, oPrincipalResultInterpreterResourceReference)
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
      var oConstant = new Constants();
      var oFhirConstants = new FhirConstants();
      var oFhirDataType = new FhirDataTypeTool();
      var oArraySupport = new ArraySupport();


      var oDiagnosticReportLogical = {
        DiagnosticReportResource: null,
        OrderingPractitionerResourceReference: null,
        PrincipalResultInterpreterPractitionerResourceReference: null,
        ProcedureRequestResource: null,
        ObservationResourceList: [],
        SubObservationResourceList: []
      }

      var SubIdProcessedArray = [];
      for (var o = 0; (o < oObservationList.length); o++) {
        var oObservation = oObservationList[o];

        if (oFacilityConfig.Implementation == ImplementationTypeEnum.CLINISEARCHPATHOLOGY) {
          var ObsCategoryCoding = oFhirDataType.GetCoding("laboratory", "http://hl7.org/fhir/observation-category", "Laboratory");
        } else if (oFacilityConfig.Implementation == ImplementationTypeEnum.CLINISEARCHRADIOLOGY) {
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
              ObsCategoryCodeableConcept);
            oDiagnosticReportLogical.ObservationResourceList.push(oObservationResource);
          } else {
            if (!oArraySupport.Contains(SubIdProcessedArray, oObservation.SubId)) {
              var oParentObservation = new ObservationFhirResource();
              oParentObservation.SetId(oFhirTool.GetGuid());
              oParentObservation.SetMetaProfile([oConstant.fhirResourceProfile.icims.observation]);
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
                  ObsCategoryCodeableConcept);
                var oSubObservationReference = oFhirDataType.GetReference(oFhirConstants.ResourceName.Observation, oSubObservation.id, undefined);
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

    function FhirObsFactory(oV2Obs, ReportIssuedDateTime, oPatientReference, ObsCategoryCodeableConcept) {
      if (oV2Obs.DataType == "ST" || oV2Obs.DataType == "NM" || oV2Obs.DataType == "FT") {
        var oFhirTool = new FhirTools();
        var oConstant = new Constants();
        var oFhirDataType = new FhirDataTypeTool();
        var oObservation = new ObservationFhirResource();

        var ObservationId = oFhirTool.GetGuid();
        oObservation.SetId(ObservationId);
        oObservation.SetMetaProfile([oConstant.fhirResourceProfile.icims.observation]);
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
      var oFhirConstants = new FhirConstants();

      var oProvenance = new ProvenanceFhirResource();
      oProvenance.SetId(oFhirTool.GetGuid());
      oProvenance.SetMetaProfile([oConstant.fhirResourceProfile.icims.provenance]);

      var TargetReferenceArray = [];
      TargetReferenceArray.push(oFhirDataType.GetReference(oFhirConstants.ResourceName.MessageHeader, oBundleLogical.MessageHeaderResource.id, oFhirConstants.ResourceName.MessageHeader));
      TargetReferenceArray.push(oFhirDataType.GetReference(oFhirConstants.ResourceName.Patient, oBundleLogical.PatientResource.id, oFhirConstants.ResourceName.Patient));
      for (var i = 0; (i < oBundleLogical.DiagnosticReportLogicalList.length); i++) {
        var DiagnosticReportLogical = oBundleLogical.DiagnosticReportLogicalList[i];
        TargetReferenceArray.push(oFhirDataType.GetReference(oFhirConstants.ResourceName.DiagnosticReport, DiagnosticReportLogical.DiagnosticReportResource.id, oFhirConstants.ResourceName.DiagnosticReport));


        // if (DiagnosticReportLogical.OrderingPractitionerResource != null) {          
        //   TargetReferenceArray.push(oFhirDataType.GetReference(oFhirConstants.ResourceName.Practitioner, DiagnosticReportLogical.OrderingPractitionerResource.id, oFhirConstants.ResourceName.Practitioner));
        // }

        // if (DiagnosticReportLogical.PrincipalResultInterpreterPractitionerResource != null) {
        //   BreakPoint;
        //   TargetReferenceArray.push(oFhirDataType.GetReference(oFhirConstants.ResourceName.Practitioner, DiagnosticReportLogical.PrincipalResultInterpreterPractitionerResource.id, oFhirConstants.ResourceName.Practitioner));
        // }

        if (DiagnosticReportLogical.ProcedureRequestResource != null) {
          TargetReferenceArray.push(oFhirDataType.GetReference(oFhirConstants.ResourceName.ProcedureRequest, DiagnosticReportLogical.ProcedureRequestResource.id, oFhirConstants.ResourceName.ProcedureRequest));
        }

        for (var o = 0; (o < DiagnosticReportLogical.ObservationResourceList.length); o++) {
          TargetReferenceArray.push(oFhirDataType.GetReference(oFhirConstants.ResourceName.Observation, DiagnosticReportLogical.ObservationResourceList[o].id, oFhirConstants.ResourceName.Observation));
        }

        for (var s = 0; (s < DiagnosticReportLogical.SubObservationResourceList.length); s++) {
          TargetReferenceArray.push(oFhirDataType.GetReference(oFhirConstants.ResourceName.Observation, DiagnosticReportLogical.SubObservationResourceList[s].id, oFhirConstants.ResourceName.Observation));
        }

      }

      Breakpoint;
      for (var p = 0; (p < oBundleLogical.PractitionerResourceList.length); p++) {
        TargetReferenceArray.push(oFhirDataType.GetReference(oBundleLogical.PractitionerResourceList[p].resourceType, oBundleLogical.PractitionerResourceList[p].id, oBundleLogical.PractitionerResourceList[p].resourceType));
      }

      for (var OrgIndex = 0; (OrgIndex < oBundleLogical.OrganizationResourceList.length); OrgIndex++) {
        TargetReferenceArray.push(oFhirDataType.GetReference(oFhirConstants.ResourceName.Organization, oBundleLogical.OrganizationResourceList[OrgIndex].id, oFhirConstants.ResourceName.Organization + " " + oBundleLogical.OrganizationResourceList[OrgIndex].name));
      }

      oProvenance.SetTarget(TargetReferenceArray);

      var Today = oFhirTool.GetNow();

      oProvenance.SetRecorded(Today);

      var activityCoding = oFhirDataType.GetCoding("CREATE", "http://hl7.org/fhir/v3/DataOperation", "create");
      oProvenance.SetActivity(activityCoding);

      var whoReference = oFhirDataType.GetReference(undefined, undefined, "HL7 Connect Integration Engine");
      var onBehalfOfReference = oFhirDataType.GetReference(oFhirConstants.ResourceName.Organization, oConstant.organization.icims.id, oConstant.organization.icims.name);
      oProvenance.SetAgent(undefined, whoReference, onBehalfOfReference);

      var messageControlIdIdentifier = null;
      if (oFacilityConfig.Implementation == ImplementationTypeEnum.CLINISEARCHPATHOLOGY) {
        messageControlIdIdentifier = oFhirDataType.GetIdentifier("official", undefined,
          oConstant.organization.dhm.codeSystem.messageControlId, MessageControlID);

      } else if (oFacilityConfig.Implementation == ImplementationTypeEnum.CLINISEARCHRADIOLOGY) {
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
      var oArraySupport = new ArraySupport();
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

      //Add Patient to Bundle
      if (oBundleLogical.PatientResource != null) {
        oBundle.AddEntry(oFhirTool.PreFixUuid(oBundleLogical.PatientResource.id), oBundleLogical.PatientResource);
      }

      //DiagnosticReports
      for (var i = 0; (i < oBundleLogical.DiagnosticReportLogicalList.length); i++) {

        //Add DiagnosticReport to Bundle
        oBundle.AddEntry(oFhirTool.PreFixUuid(oBundleLogical.DiagnosticReportLogicalList[i].DiagnosticReportResource.id), oBundleLogical.DiagnosticReportLogicalList[i].DiagnosticReportResource);

        //Add ProcedureRequest to Bundle  
        if (oBundleLogical.DiagnosticReportLogicalList[i].ProcedureRequestResource != null) {
          oBundle.AddEntry(oFhirTool.PreFixUuid(oBundleLogical.DiagnosticReportLogicalList[i].ProcedureRequestResource.id), oBundleLogical.DiagnosticReportLogicalList[i].ProcedureRequestResource);
        }

        //Add Observations to Bundle        
        for (var o = 0; (o < oBundleLogical.DiagnosticReportLogicalList[i].ObservationResourceList.length); o++) {
          var ob = oBundleLogical.DiagnosticReportLogicalList[i].ObservationResourceList[o];
          oBundle.AddEntry(oFhirTool.PreFixUuid(oBundleLogical.DiagnosticReportLogicalList[i].ObservationResourceList[o].id), oBundleLogical.DiagnosticReportLogicalList[i].ObservationResourceList[o]);
          //The only reason we arrange the SubObservations this way it to remain backward compatible with the solution prior to implementing the Multi-OBR Radiology reports
          if (ob.related != null) {
            for (var q = 0; (q < ob.related.length); q++) {
              var SubObservationId = ob.related[q].target.reference;
              var SubObservationResource = oArraySupport.Find(oBundleLogical.DiagnosticReportLogicalList[i].SubObservationResourceList, "id", SubObservationId.split('/')[1]);
              if (SubObservationResource != null) {
                oBundle.AddEntry(oFhirTool.PreFixUuid(SubObservationResource.id), SubObservationResource);
              } else {
                throw new Error("Unable to locate a sub related Observation referenced by a parent Observation.");
              }
            }
          }
        }
      }

      //Add Practitioner to Bundle
      for (var p = 0; (p < oBundleLogical.PractitionerResourceList.length); p++) {
        oBundle.AddEntry(oFhirTool.PreFixUuid(oBundleLogical.PractitionerResourceList[p].id), oBundleLogical.PractitionerResourceList[p]);
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
      output = output.replace(/\\H\\/g, "<b>").replace(/\\N\\/g, "</b>");//HL7 V2 Highligh Off (Normal Text on)
      output = output + "  </pre>\n</div>";
      return output;
    }

    function FindPractitionerResourceIdByIdentifier(oPractitionerResourceList, IdentifierValue, IdentifierSystem) {
      for (var r = 0; (r < oPractitionerResourceList.length); r++) {
        if (oPractitionerResourceList[r].identifier != null && oPractitionerResourceList[r].identifier != undefined) {
          for (var i = 0; (i < oPractitionerResourceList[r].identifier.length); i++) {
            if (oPractitionerResourceList[r].identifier[i].system == IdentifierSystem) {
              if (oPractitionerResourceList[r].identifier[i].value == IdentifierValue) {
                return oPractitionerResourceList[r];
              }
            }
          }
        }
      }
      return null;
    }


  }