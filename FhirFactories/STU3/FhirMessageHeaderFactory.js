function FhirMessageHeaderFactory() {

    this.GetResource = function (oMeta, oFacilityConfig) {
      return new CreateMessageHeaderResource(oMeta, oFacilityConfig);
    };

    function CreateMessageHeaderResource(oMeta, oFacilityConfig) {
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
}
