
<% include $repo$\FhirLibrary\Resource.js %>
<% include $repo$\FhirLibrary\DomainResource.js %>
<% include $repo$\FhirLibrary\BundleFhirResource.js %>
<% include $repo$\FhirLibrary\MessageHeaderFhirResource.js %>
<% include $repo$\FhirLibrary\OrganizationFhirResource.js %>
<% include $repo$\FhirLibrary\DiagnosticReportFhirResource.js %>
<% include $repo$\FhirLibrary\PatientFhirResource.js %>
<% include $repo$\FhirLibrary\ObservationFhirResource.js %>
<% include $repo$\FhirLibrary\ProvenanceFhirResource.js %>
<% include $repo$\FhirLibrary\FhirDataTypeTool.js %>
<% include $repo$\FhirLibrary\FhirTools.js %>
<% include $repo$\FhirLibrary\FhirConfig.js %>


  function FhirResourceFactory() {

    this.CreateADTBundle = function (oModels) {
      return new CreateADTBundle(oModels);
    };

    function CreateADTBundle(oModels) {

      var oFhirConfig = new FhirConfig();
      var oFhirTool = new FhirTools();
      var oFhirDataType = new FhirDataTypeTool();

      //When sending to a [base]/fhir/Bundle endpoint for testing as a POST
      //you can not have an id, however, when sending to $process-message you must
      var oBundle = new BundleFhirResource();
      oBundle.SetId(oFhirTool.GetGuid());
      oBundle.SetType("message");
      //var bundleProfileUrl = oFhirTool.PathCombine([IcimsProfileBase, IcimsMessageBundleProfileName]);
      //oBundle.SetMetaProfile([bundleProfileUrl]);

      //--------------------------------------------------------------------------
      //MessageHeader Resource
      //--------------------------------------------------------------------------
      var MessageHeaderId = oModels.MessageHeader.MessageControlID;
      var oMsgHeader = new MessageHeaderFhirResource();
      oMsgHeader.SetId(MessageHeaderId);
      //var msgHeadProfileUrl = FhirTool.PathCombine([IcimsProfileBase, IcimsMessageHeaderProfileName], "/");
      //oMsgHeader.SetMetaProfile([msgHeadProfileUrl]);
      var HeaderEventCoding = oFhirDataType.GetCoding(oModels.MessageHeader.MessageType + oModels.MessageHeader.MessageEvent, oFhirConfig.HL7V2MessageTypeEventCodeSystemUri, "HL7 V2 Message Type Event");
      oMsgHeader.SetEvent(HeaderEventCoding);
      oMsgHeader.SetDestination(oModels.FacilityConfig.Fhir.ReceivingOrganizationName, undefined, oModels.FacilityConfig.Fhir.FhirEndpoint);
      oMsgHeader.SetTimestamp(oFhirTool.SetTimeZone(oModels.MessageHeader.MessageDateTime.AsXML));
      var oReceiverReference = oFhirDataType.GetReference(oFhirConfig.ResourceName.Organization, oModels.FacilityConfig.Fhir.ReceivingOrganizationResourceId, oModels.FacilityConfig.Fhir.ReceivingOrganizationName);
      oMsgHeader.SetReceiver(oReceiverReference);
      var oSenderReference = oFhirDataType.GetReference(oFhirConfig.ResourceName.Organization, oModels.FacilityConfig.Fhir.SendingOrganizationResourceId, oModels.FacilityConfig.Fhir.SendingOrganizationName);
      oMsgHeader.SetSender(oSenderReference);
      oMsgHeader.SetSource(oModels.MessageHeader.SendingApplication);
      var messageheaderResponseRequestExtension = oFhirDataType.GetExtension("http://hl7.org/fhir/StructureDefinition/messageheader-response-request", "valueCode", "on-error");
      oMsgHeader.SetExtension(messageheaderResponseRequestExtension);
      var PatientId = oFhirTool.GetGuid();
      var oFocusReference = oFhirDataType.GetReference(oFhirConfig.ResourceName.Patient, PatientId, oFhirConfig.ResourceName.Patient);
      oMsgHeader.SetFocus(oFocusReference);
      oBundle.AddEntry(oFhirTool.PreFixUuid(MessageHeaderId), oMsgHeader);

      //--------------------------------------------------------------------------
      //Patient Resource
      //--------------------------------------------------------------------------


      var oPatient = new PatientFhirResource();
      oPatient.SetId(PatientId);

      //var patientProfileUrl = oFhirTool.PathCombine([IcimsProfileBase, IcimsPatientProfileName], "/");
      //oPatient.SetMetaProfile(["http://hl7.org.au/fhir/StructureDefinition/au-patient", patientProfileUrl]);

      var PatientIdentifierArray = [];

      //MRN
      var oPatMrnTypeCoding = oFhirDataType.GetCoding("MR", "http://hl7.org/fhir/v2/0203", "Medical record number");
      var oPatMrnType = oFhirDataType.GetCodeableConcept(oPatMrnTypeCoding, "Medical record number");
      var MrnIdentifier = oFhirDataType.GetIdentifier("official", oPatMrnType,
        oModels.FacilityConfig.PrimaryMRNSystemUri,
        oModels.Patient.PrimaryMrnValue);
      PatientIdentifierArray.push(MrnIdentifier);

      //MedicareNumber
      if (oModels.Patient.MedicareNumberValue != null) {
        var oPatMedicareTypeCoding = oFhirDataType.GetCoding("MC", "http://hl7.org/fhir/v2/0203", "Medicare Number");
        var oPatMedicareType = oFhirDataType.GetCodeableConcept(oPatMedicareTypeCoding, "Medicare Number");
        var MedicareIdentifier = oFhirDataType.GetIdentifier("official", oPatMedicareType,
          oFhirConfig.MedicareNumberSystemUri,
          oModels.Patient.MedicareNumberValue);
        PatientIdentifierArray.push(MedicareIdentifier);
      }

      oPatient.SetIdentifier(PatientIdentifierArray);

      var HumanName = oFhirDataType.GetHumanName("official", oModels.Patient.FormattedName,
        oModels.Patient.Family,
        oModels.Patient.Given,
        oModels.Patient.Title);
      oPatient.SetName([HumanName]);
      oPatient.SetGender(oModels.Patient.Gender);
      oPatient.SetBirthDate(oFhirTool.RemoveTimeFromDataTimeString(oModels.Patient.Dob.AsXML));

      var FHIRAddressList = [];
      for (var i = 0; i < oModels.Patient.PatientAddressList.length; i++) {
        var PatientAddress = oModels.Patient.PatientAddressList[i];
        var lineArray = [];
        if (PatientAddress.AddressLine1 != null) {
          lineArray.push(PatientAddress.AddressLine1);
        }
        if (PatientAddress.AddressLine2 != null) {
          lineArray.push(PatientAddress.AddressLine2);
        }

        var oAddress = oFhirDataType.GetAddressAustrlian(undefined, PatientAddress.FormattedAddress,
          lineArray, PatientAddress.Suburb, undefined, PatientAddress.Postcode);
        FHIRAddressList.push(oAddress);
      }

      oPatient.SetAddress(FHIRAddressList);

      //Add Patient to Bundle
      oBundle.AddEntry(oFhirTool.PreFixUuid(PatientId), oPatient);

      //--------------------------------------------------------------------------
      //Organization ICIMS
      //--------------------------------------------------------------------------
      var oSenderOrg = new OrganizationFhirResource();
      oSenderOrg.SetId(oModels.FacilityConfig.Fhir.SendingOrganizationResourceId);
      //var oOrgProfileUrl = oFhirTool.PathCombine([IcimsProfileBase, IcimsOrganizationProfileName]);
      //oOrgIcims.SetMetaProfile(["http://hl7.org.au/fhir/StructureDefinition/au-organisation", oOrgProfileUrl]);
      oSenderOrg.SetName(oModels.FacilityConfig.Fhir.ReceivingOrganizationName);
      //oOrgIcims.SetAlias(IcimsOrganizationAliasArray);
      //Add Organization ICIMS to Bundle
      oBundle.AddEntry(oFhirTool.PreFixUuid(oModels.FacilityConfig.Fhir.SendingOrganizationResourceId), oSenderOrg);

      //--------------------------------------------------------------------------
      //Organization SAH
      //--------------------------------------------------------------------------
      var oReceiverOrg = new OrganizationFhirResource();
      oReceiverOrg.SetId(oModels.FacilityConfig.Fhir.ReceivingOrganizationResourceId);
      //oReceiverOrg.SetMetaProfile([oOrgProfileUrl]);
      oReceiverOrg.SetName(oModels.FacilityConfig.Fhir.ReceivingOrganizationName);
      //oReceiverOrg.SetAlias(SAHOrganizationAliasArray);
      //Add Organization SAH to Bundle
      oBundle.AddEntry(oFhirTool.PreFixUuid(oModels.FacilityConfig.Fhir.ReceivingOrganizationResourceId), oReceiverOrg);

      //--------------------------------------------------------------------------
      //Provenance SAH
      //--------------------------------------------------------------------------
      var provenanceId = oFhirTool.GetGuid();
      var oProvenance = new ProvenanceFhirResource();
      oProvenance.SetId(provenanceId);
      //var oProvenanceProfileUrl = oFhirTool.PathCombine([IcimsProfileBase, IcimsProvenanceProfileName]);
      //oProvenance.SetMetaProfile([oProvenanceProfileUrl]);

      var TargetReferenceArray = [];
      for (var i = 0; i < oBundle.entry.length; i++) {
        var oResource = oBundle.entry[i].resource;
        TargetReferenceArray.push(oFhirDataType.GetReference(oResource.resourceType, oResource.id, oResource.resourceType));
      }
      // TargetReferenceArray.push(oFhirDataType.GetReference(oFhirConfig.ResourceName.MessageHeader, MessageHeaderId, oFhirConfig.ResourceName.MessageHeader));
      // TargetReferenceArray.push(oFhirDataType.GetReference(oFhirConfig.ResourceName.Patient, PatientId, oFhirConfig.ResourceName.Patient));
      // TargetReferenceArray.push(oFhirDataType.GetReference(oFhirConfig.ResourceName.Organization, oModels.FacilityConfig.Fhir.SendingOrganizationResourceId, oModels.FacilityConfig.Fhir.SendingOrganizationName));
      // TargetReferenceArray.push(oFhirDataType.GetReference(oFhirConfig.ResourceName.Organization, oModels.FacilityConfig.Fhir.ReceivingOrganizationResourceId, oModels.FacilityConfig.Fhir.ReceivingOrganizationName));
      oProvenance.SetTarget(TargetReferenceArray);

      var Today = oFhirTool.GetNow();

      //var xDate = Date().toLocaleString();
      oProvenance.SetRecorded(Today);

      var activityCoding = oFhirDataType.GetCoding("CREATE", "http://hl7.org/fhir/v3/DataOperation", "create");
      oProvenance.SetActivity(activityCoding);

      BreakPoint;
      var whoReference = oFhirDataType.GetReference(undefined, undefined, "HL7 Connect Integration Engine");
      var onBehalfOfReference = oFhirDataType.GetReference(oFhirConfig.ResourceName.Organization, oModels.FacilityConfig.Fhir.ReceivingOrganizationResourceId, oModels.FacilityConfig.Fhir.ReceivingOrganizationName);
      oProvenance.SetAgent(undefined, whoReference, onBehalfOfReference);

      var messageControlIdIdentifier = oFhirDataType.GetIdentifier("official", undefined,
        oModels.FacilityConfig.Fhir.HL7V2MessageControlIdSystemUri, oModels.MessageHeader.MessageControlID);
      oProvenance.SetEntity("source", messageControlIdIdentifier);

      //Add Provenanceto Bundle
      oBundle.AddEntry(oFhirTool.PreFixUuid(provenanceId), oProvenance);

      return oBundle;
    }


  }