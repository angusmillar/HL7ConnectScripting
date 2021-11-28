function FhirBundleFactory() {

    this.GetResource = function (oBundleLogical) {
      return new CreateBundleResource(oBundleLogical);
    };

    function CreateBundleResource(oBundleLogical) {      
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
}





