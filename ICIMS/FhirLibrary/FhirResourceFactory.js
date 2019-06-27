
<%include $repo$\ICIMS\FhirLibrary\BundleFhirResource.js%>
<%include $repo$\ICIMS\FhirLibrary\MessageHeaderFhirResource.js%>
<%include $repo$\ICIMS\FhirLibrary\OrganizationFhirResource.js%>
<%include $repo$\ICIMS\FhirLibrary\FhirTools.js%>

function FhirResourceFactory(){
 
  this.CreatePathologyBundle = function(oModels)
  {
    return new CreatePathologyBundle(oModels);
  };

  function CreatePathologyBundle(oModels){
    BreakPoint;
    var FhirTool = new FhirTools();
    var IcimsOrganizationId = "B9B121A5-608D-4E83-A729-1576E06BA09F";
    var IcimsOrganizationName = "ICIMS";
    var IcimsOrganizationAliasArray = ["Innovative Clinical Information Management Systems"];

    var SAHOrganizationId = "F6383350-CCA5-4726-A4A4-7C82A40BBE7";
    var SAHOrganizationName = "SAH";
    var SAHOrganizationAliasArray = ["SAN", "Sydney Adventist Hospital"];

    var DiagnosticReportId = GUID();


    var oBundle = new BundleFhirResource();
    var MessageHeaderId = GUID();
    var oMsgHeader = new MessageHeaderFhirResource(MessageHeaderId,oModels);
    oMsgHeader.SetReceiver(SAHOrganizationId, IcimsOrganizationName);
    oMsgHeader.SetSender(IcimsOrganizationId, SAHOrganizationName);
    oMsgHeader.SetSource(oModels.Pathology.Meta.SendingApplication);
    oMsgHeader.SetFocus(DiagnosticReportId, "DiagnosticReport");
    oBundle.AddEntry(FhirTool.PreFixUuid(MessageHeaderId),oMsgHeader.GetResource());
    
    
    var oOrgIcims = new OrganizationFhirResource(IcimsOrganizationId, IcimsOrganizationName);
    oOrgIcims.SetAlias(IcimsOrganizationAliasArray);
    oBundle.AddEntry(FhirTool.PreFixUuid(IcimsOrganizationId),oOrgIcims.GetResource());

    var oOrgSAH = new OrganizationFhirResource(SAHOrganizationId, SAHOrganizationName);
    oOrgSAH.SetAlias([SAHOrganizationAliasArray]);
    oBundle.AddEntry(FhirTool.PreFixUuid(SAHOrganizationId),oOrgSAH.GetResource());

    return oBundle.GetResource();
  }

  
}