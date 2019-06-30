
<%include $repo$\ICIMS\FhirLibrary\BundleFhirResource.js%>
<%include $repo$\ICIMS\FhirLibrary\MessageHeaderFhirResource.js%>
<%include $repo$\ICIMS\FhirLibrary\OrganizationFhirResource.js%>
<%include $repo$\ICIMS\FhirLibrary\DiagnosticReportFhirResource.js%>
<%include $repo$\ICIMS\FhirLibrary\PatientFhirResource.js%>
<%include $repo$\ICIMS\FhirLibrary\ObservationFhirResource.js%>
<%include $repo$\ICIMS\FhirLibrary\FhirDataTypeTool.js%>
<%include $repo$\ICIMS\FhirLibrary\FhirTools.js%>

function FhirResourceFactory(){
 
  this.CreatePathologyBundle = function(oModels)
  {
    return new CreatePathologyBundle(oModels);
  };

  function CreatePathologyBundle(oModels){

BreakPoint;

    var FhirTool = new FhirTools();
    var FhirDataType = new FhirDataTypeTool();
    
    var IcimsOrganizationId = "bab13701-776a-41fd-86a9-7aa19df2825d";
    var IcimsOrganizationName = "ICIMS";
    var IcimsOrganizationAliasArray = ["Innovative Clinical Information Management Systems"];

    var SAHOrganizationId = "95f4641f-6de7-470c-a44c-90ef5eb17faf";
    var SAHOrganizationName = "SAH";
    var SAHOrganizationAliasArray = ["SAN", "Sydney Adventist Hospital"];
//FhirTool.GetGuid()
    var oBundle = new BundleFhirResource(undefined);

    //--------------------------------------------------------------------------
    //MessageHeader Resource
    //--------------------------------------------------------------------------
    var MessageHeaderId = FhirTool.GetGuid();
    var oMsgHeader = new MessageHeaderFhirResource(MessageHeaderId, oModels);
    oMsgHeader.SetReceiver(IcimsOrganizationId, IcimsOrganizationName);
    oMsgHeader.SetSender(SAHOrganizationId, SAHOrganizationName);
    oMsgHeader.SetSource(oModels.Pathology.Meta.SendingApplication);
    oMsgHeader.SetMessageHeaderResponseRequestExt("on-error");
    var DiagnosticReportId = FhirTool.GetGuid();
    oMsgHeader.SetFocus(DiagnosticReportId, "DiagnosticReport");
    oBundle.AddEntry(FhirTool.PreFixUuid(MessageHeaderId), oMsgHeader.GetResource());

    //--------------------------------------------------------------------------
    //Patient Resource
    //--------------------------------------------------------------------------
    var PatientId = FhirTool.GetGuid();
    var oPatient = new PatientFhirResource(PatientId);
    oPatient.SetActive(true);
    //MRN
    var oPatMrnTypeCoding = FhirDataType.GetCoding("MR", "http://hl7.org/fhir/v2/0203", "Medical record number");
    var oPatMrnType = FhirDataType.GetCodeableConcept(oPatMrnTypeCoding, "Medical record number")
    var MrnIdentifier = FhirDataType.GetIdentifier("official", oPatMrnType,
      oModels.FacilityConfig.PrimaryMRNSystemUri,
      oModels.Pathology.Patient.PrimaryMrnValue)
    //MedicareNumber
    var oPatMedicareTypeCoding = FhirDataType.GetCoding("MC", "http://hl7.org/fhir/v2/0203", "Medicare Number");
    var oPatMedicareType = FhirDataType.GetCodeableConcept(oPatMedicareTypeCoding, "Medicare Number")
    var MedicareIdentifier = FhirDataType.GetIdentifier("official", oPatMedicareType,
      "http://ns.electronichealth.net.au/id/medicare-number",
      oModels.Pathology.Patient.MedicareNumberValue)

    oPatient.SetIdentifier([MrnIdentifier, MedicareIdentifier]);

    var HumanName = FhirDataType.GetHumanName("official", oModels.Pathology.Patient.FormattedName,
      oModels.Pathology.Patient.Family,
      oModels.Pathology.Patient.Given,
      oModels.Pathology.Patient.Title)
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

    var oAddress = FhirDataType.GetAddressAustrlian(undefined, PatientAddress.FormattedAddress, lineArray, PatientAddress.Suburb, undefined, PatientAddress.Postcode)
    oPatient.SetAddress([oAddress])

    //--------------------------------------------------------------------------
    //Observation Resource List
    //--------------------------------------------------------------------------
    var oPatientReference = FhirDataType.GetReference(PatientId, oModels.Pathology.Patient.FormattedName );
    var ObsCategoryCoding = FhirDataType.GetCoding("procedure", "http://hl7.org/fhir/observation-category", "Procedure");
    var ObsCategoryCodeableConcept = FhirDataType.GetCodeableConcept(ObsCategoryCoding);
    
    var ObservationResourceList = [];
    for (var i=0; (i < oModels.Pathology.ObservationList.length); i++) {
      if (oModels.Pathology.ObservationList[i].Code != "PDF" && oModels.Pathology.ObservationList[i].CodeSystem != "AUSPDI"){
        if (oModels.Pathology.ObservationList[i].DataType == "ST"){
          var ObservationId = FhirTool.GetGuid();
          var oObservation = new ObservationFhirResource(ObservationId);
          oObservation.SetStatus(oModels.Pathology.ObservationList[i].Status);

          oObservation.SetCategory([ObsCategoryCodeableConcept]);

          var ObsCodeCoding = FhirDataType.GetCoding(oModels.Pathology.ObservationList[i].Code, "https://www.sah.org.au/systems/fhir/observation/procedure-observation", oModels.Pathology.ObservationList[i].CodeDescription);
          var ObsCodeCodeableConcept = FhirDataType.GetCodeableConcept(ObsCodeCoding);
          oObservation.SetCode(ObsCodeCodeableConcept);

          oObservation.SetSubject(oPatientReference);
          //Collection DateTime Clinically relevant date Time
          oObservation.SetEffectiveDateTime(oModels.Pathology.Report.ReportIssuedDateTime.AsXML);
          //Time off analyser, when the observation was observerd
          oObservation.SetIssued(oModels.Pathology.ObservationList[i].ObsDateTime.AsXML);
          //The Result
          oObservation.SetValueString(oModels.Pathology.ObservationList[i].Value);
          ObservationResourceList.push(oObservation.GetResource());
        }
      }
    }

    //--------------------------------------------------------------------------
    //DiagnosticReport Resource
    //--------------------------------------------------------------------------
    var oDiagReport = new DiagnosticReportFhirResource(DiagnosticReportId);

    var oTypeCoding = FhirDataType.GetCoding("FILL", "http://hl7.org/fhir/identifier-type", "Filler Identifier");
    var oType = FhirDataType.GetCodeableConcept(oTypeCoding, "Report Identifier")
    var ReportIdentifier = FhirDataType.GetIdentifier("official", oType,
      FhirTool.PreFixUuid(oModels.Pathology.Report.FillerOrderNumberUniversalId.toLowerCase()),
      oModels.Pathology.Report.FillerOrderNumberValue)

    oDiagReport.SetIdentifierArray([ReportIdentifier])
    oDiagReport.SetStatus(oModels.Pathology.Report.Status);
    
    var oCategoryCoding = FhirDataType.GetCoding(oModels.Pathology.Report.DiagServSectId, "http://hl7.org/fhir/v2/0074");
    var oCategoryCodeableConcept = FhirDataType.GetCodeableConcept(oCategoryCoding, "Diagnostic Service Section Codes");
    oDiagReport.SetCategory(oCategoryCodeableConcept);

    var oCodeCoding = FhirDataType.GetCoding(oModels.Pathology.Report.ReportCode, "http://loinc.org", oModels.Pathology.Report.ReportCodeDescription);
    var oCodeCodeableConcept = FhirDataType.GetCodeableConcept(oCodeCoding);
    oDiagReport.SetCode(oCodeCodeableConcept);
    oDiagReport.SetSubject(oPatientReference);

    oDiagReport.SetEffectiveDateTime(oModels.Pathology.Report.CollectionDateTime.AsXML);
    oDiagReport.SetIssued(oModels.Pathology.Report.ReportIssuedDateTime.AsXML);

    //Add All the Observation References to the DiagnosticReport Resource
    var ResultReferenceArray = [];
    for (var i=0; (i < ObservationResourceList.length); i++) {
      var oObsReference = FhirDataType.GetReference(ObservationResourceList[i].id, ObservationResourceList[i].code.coding.display );
      ResultReferenceArray.push(oObsReference);
    }
    oDiagReport.SetResult(ResultReferenceArray);

    //Get the base64 encoded PDF from the ObservationList and add to the DiagnosticReport Resource
    //property named 'presentedForm'
    for (var i=0; (i < oModels.Pathology.ObservationList.length); i++) {
      if (oModels.Pathology.ObservationList[i].Code == "PDF" && oModels.Pathology.ObservationList[i].CodeSystem == "AUSPDI"){
        var oPdfAttachment = FhirDataType.GetPdfAttachment(oModels.Pathology.ObservationList[i].Value);
        oDiagReport.SetPresentedForm([oPdfAttachment]);
        break;
      }
    }

    //Add DiagnosticReport to Bundle
    oBundle.AddEntry(FhirTool.PreFixUuid(DiagnosticReportId), oDiagReport.GetResource());

    //Add Patient to Bundle
    oBundle.AddEntry(FhirTool.PreFixUuid(PatientId), oPatient.GetResource());

    //Add Observations to Bundle
    for (var i=0; (i < ObservationResourceList.length); i++) {
      oBundle.AddEntry(FhirTool.PreFixUuid(ObservationResourceList[i].id), ObservationResourceList[i]);
    }
    
    //--------------------------------------------------------------------------
    //Organization ICIMS
    //--------------------------------------------------------------------------
    var oOrgIcims = new OrganizationFhirResource(IcimsOrganizationId, IcimsOrganizationName);
    oOrgIcims.SetAlias(IcimsOrganizationAliasArray);
    //Add Organization ICIMS to Bundle
    oBundle.AddEntry(FhirTool.PreFixUuid(IcimsOrganizationId), oOrgIcims.GetResource());

    //--------------------------------------------------------------------------
    //Organization SAH
    //--------------------------------------------------------------------------
    var oOrgSAH = new OrganizationFhirResource(SAHOrganizationId, SAHOrganizationName);
    oOrgSAH.SetAlias(SAHOrganizationAliasArray);
    //Add Organization SAH to Bundle
    oBundle.AddEntry(FhirTool.PreFixUuid(SAHOrganizationId), oOrgSAH.GetResource());

    return oBundle.GetResource();
  }

  
}