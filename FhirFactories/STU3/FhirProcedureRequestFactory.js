function FhirProcedureRequestFactory() {

    this.GetResource = function (oPatientReference, oPractitionerReference) {
      return new CreateProcedureRequestResource(oPatientReference, oPractitionerReference);
    };

    function CreateProcedureRequestResource(oPatientReference, oPractitionerReference) {
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

}





