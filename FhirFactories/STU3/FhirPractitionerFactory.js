function FhirPractitionerFactory() {

    this.GetResource = function (oPractitioner, IdentifierSystem) {
      return new CreatePractitionerResource(oPractitioner, IdentifierSystem);
    };

    function CreatePractitionerResource(oPractitioner, IdentifierSystem) {
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
          } else if (oPractitioner.Identifier != null) {
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

}





