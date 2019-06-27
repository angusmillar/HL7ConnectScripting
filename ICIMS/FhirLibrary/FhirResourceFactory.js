
<%include $repo$\ICIMS\FhirLibrary\BundleFhirResource.js%>
<%include $repo$\ICIMS\FhirLibrary\MessageHeaderFhirResource.js%>
<%include $repo$\ICIMS\FhirLibrary\OrganizationFhirResource.js%>
<%include $repo$\ICIMS\FhirLibrary\DiagnosticReportFhirResource.js%>
<%include $repo$\ICIMS\FhirLibrary\FhirDataTypeTool.js%>
<%include $repo$\ICIMS\FhirLibrary\FhirTools.js%>

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

    var PatientId = FhirTool.GetGuid();
    var DiagnosticReportId = FhirTool.GetGuid();


    var oBundle = new BundleFhirResource(FhirTool.GetGuid());
    var MessageHeaderId = FhirTool.GetGuid();
    var oMsgHeader = new MessageHeaderFhirResource(MessageHeaderId, oModels);
    oMsgHeader.SetReceiver(IcimsOrganizationId, IcimsOrganizationName);
    oMsgHeader.SetSender(SAHOrganizationId, SAHOrganizationName);
    oMsgHeader.SetSource(oModels.Pathology.Meta.SendingApplication);
    oMsgHeader.SetFocus(DiagnosticReportId, "DiagnosticReport");
    oBundle.AddEntry(FhirTool.PreFixUuid(MessageHeaderId), oMsgHeader.GetResource());
    
    var DiagnosticReportId = FhirTool.GetGuid();
    var oDiagReport = new DiagnosticReportFhirResource(DiagnosticReportId);

    var oTypeCoding = FhirDataType.GetCoding("MR", "http://hl7.org/fhir/v2/0203", "Medical record number");
    var oType = FhirDataType.GetCodeableConcept(oTypeCoding, "Medical record number")
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

    var oPatientReference = FhirDataType.GetReference(PatientId, oModels.Pathology.Patient.Family.toUpperCase() + " " + oModels.Pathology.Patient.Given );
    oDiagReport.SetSubject(oPatientReference);

    oDiagReport.SetEffectiveDateTime(oModels.Pathology.Report.CollectionDateTime.AsXML);

    oDiagReport.SetIssued(oModels.Pathology.Report.ReportIssuedDateTime.AsXML);

BreakPoint;
    var oPdfAttachment = FhirDataType.GetPdfAttachment(oModels.Pathology.Base64Pdf);
    oDiagReport.SetPresentedForm([oPdfAttachment]);

    oBundle.AddEntry(FhirTool.PreFixUuid(DiagnosticReportId), oDiagReport.GetResource());

    var oOrgIcims = new OrganizationFhirResource(IcimsOrganizationId, IcimsOrganizationName);
    oOrgIcims.SetAlias(IcimsOrganizationAliasArray);
    oBundle.AddEntry(FhirTool.PreFixUuid(IcimsOrganizationId), oOrgIcims.GetResource());

    var oOrgSAH = new OrganizationFhirResource(SAHOrganizationId, SAHOrganizationName);
    oOrgSAH.SetAlias([SAHOrganizationAliasArray]);
    oBundle.AddEntry(FhirTool.PreFixUuid(SAHOrganizationId), oOrgSAH.GetResource());


    return oBundle.GetResource();
  }

  
}