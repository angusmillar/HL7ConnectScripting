
<%include $repo$\FhirLibrary\Resource.js%>
<%include $repo$\FhirLibrary\DomainResource.js%>
<%include $repo$\FhirLibrary\BundleFhirResource.js%>
<%include $repo$\FhirLibrary\MessageHeaderFhirResource.js%>
<%include $repo$\FhirLibrary\OrganizationFhirResource.js%>
<%include $repo$\FhirLibrary\DiagnosticReportFhirResource.js%>
<%include $repo$\FhirLibrary\PatientFhirResource.js%>
<%include $repo$\FhirLibrary\ObservationFhirResource.js%>
<%include $repo$\FhirLibrary\ProvenanceFhirResource.js%>
<%include $repo$\FhirLibrary\FhirDataTypeTool.js%>
<%include $repo$\FhirLibrary\FhirTools.js%>

function FhirResourceFactory(){
  
  this.CreatePathologyBundle = function(oModels)
  {
    return new CreatePathologyBundle(oModels);
  };

  function CreatePathologyBundle(oModels){

    var FhirTool = new FhirTools();
    var FhirDataType = new FhirDataTypeTool();

    var IcimsOrganizationId = "bab13701-776a-41fd-86a9-7aa19df2825d";
    var IcimsOrganizationName = "ICIMS";
    var IcimsOrganizationAliasArray = ["Innovative Clinical Information Management Systems"];

    var SAHOrganizationId = "95f4641f-6de7-470c-a44c-90ef5eb17faf";
    var SAHOrganizationName = "SAH";
    var SAHOrganizationAliasArray = ["SAN", "Sydney Adventist Hospital"];

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
    //var msgHeadProfileUrl = FhirTool.PathCombine([IcimsProfileBase, IcimsMessageHeaderProfileName], "/");
    //oMsgHeader.SetMetaProfile([msgHeadProfileUrl]);
    var HeaderEventCoding = FhirDataType.GetCoding("diagnosticreport-provide", "http://hl7.org/fhir/message-events", "diagnosticreport-provide");
    oMsgHeader.SetEvent(HeaderEventCoding);
    oMsgHeader.SetDestination("ICIMS", undefined, oModels.FacilityConfig.EndPoint);
    oMsgHeader.SetTimestamp(FhirTool.SetTimeZone(oModels.MessageHeader.MessageDateTime.AsXML));
    var oReceiverReference = FhirDataType.GetReference("Organization", IcimsOrganizationId, IcimsOrganizationName);
    oMsgHeader.SetReceiver(oReceiverReference);
    var oSenderReference = FhirDataType.GetReference("Organization", SAHOrganizationId, SAHOrganizationName);
    oMsgHeader.SetSender(oSenderReference);
    oMsgHeader.SetSource(oModels.MessageHeader.SendingApplication);
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
    if (oModels.Pathology.Patient.MedicareNumberValue != null){
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
    if (PatientAddress.AddressLine1 != null){
      lineArray.push(PatientAddress.AddressLine1);
    }
    if (PatientAddress.AddressLine2 != null){
      lineArray.push(PatientAddress.AddressLine2);
    }

    var oAddress = FhirDataType.GetAddressAustrlian(undefined, PatientAddress.FormattedAddress,
      lineArray, PatientAddress.Suburb, undefined, PatientAddress.Postcode);
    oPatient.SetAddress([oAddress]);

    //Add Patient to Bundle
    oBundle.AddEntry(FhirTool.PreFixUuid(PatientId), oPatient);
    
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
    for (var i=0; (i < ObservationResourceList.length); i++) {
      TargetReferenceArray.push(FhirDataType.GetReference("Observation", ObservationResourceList[i].id, "Observation"));
    }
    TargetReferenceArray.push(FhirDataType.GetReference("Organization", IcimsOrganizationId, "Organization ICIMS"));
    TargetReferenceArray.push(FhirDataType.GetReference("Organization", SAHOrganizationId, "Organization SAH"));
    oProvenance.SetTarget(TargetReferenceArray);
    
    var Today = FhirTool.GetNow();
    
    //var xDate = Date().toLocaleString();
    oProvenance.SetRecorded(Today);
    
    var activityCoding = FhirDataType.GetCoding("CREATE", "http://hl7.org/fhir/v3/DataOperation", "create");
    oProvenance.SetActivity(activityCoding);

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

  
}