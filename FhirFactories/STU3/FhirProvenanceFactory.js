function FhirProvenanceFactory() {

    this.GetResource = function (oBundleLogical, MessageControlID, oFacilityConfig) {
      return new CreateProvenanceResource(oBundleLogical, MessageControlID, oFacilityConfig);
    };

    function CreateProvenanceResource(oBundleLogical, MessageControlID, oFacilityConfig) {
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

}





