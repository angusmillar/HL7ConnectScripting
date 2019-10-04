function HL7V2ToFhirMapping(oFacilityConfig) {

  this.FhirConfig = new FhirConfig();

  this.AllergyIntoleranceCategoryCodeMap = function (oV2Code) {
    return AllergyIntoleranceCategoryCodeMap(this.FhirConfig, oFacilityConfig, oV2Code);
  }

  function AllergyIntoleranceCategoryCodeMap(oFhirConfig, oFacilityConfig, oV2Code) {
    var CodeSystem = oFhirConfig.AllergyIntoleranceCategoryCodeSystem;
    switch (oFacilityConfig.SiteContext) {
      //If needing to customise for a different site do below:
      // case oFacilityConfig.SiteContextEnum.TST: {
      //   switch (oV2Code.toUpperCase()) {
      //     case "AA":
      //       return { Code: "biologic", Display: "	Biologic", System: CodeSystem };
      //       break;
      //     default:
      //       throw "The Patient Class  found in PV1-2 was not an expected, value is : " + oPV1.Field(2).AsString + ", allowed values are (E,I,O).";
      //   }
      // }
      default: {
        //Default HL7 V2 table 0127: Allergen type
        switch (oV2Code.toUpperCase()) {
          case "AA": //Animal
            return { Code: "biologic", Display: "	Biologic", System: CodeSystem };
            break;
          case "DA": //Drug
            return { Code: "medication", Display: "Medication", System: CodeSystem };
            break;
          case "EA": //Environment
            return { Code: "environment", Display: "Environment", System: CodeSystem };
            break;
          case "FA": //Food
            return { Code: "food", Display: "Food", System: CodeSystem };
            break;
          case "LA": //Pollen
            return { Code: "environment", Display: "Environment", System: CodeSystem };
            break;
          case "MA": //Miscellaneous
            return { Code: "environment", Display: "Environment", System: CodeSystem };
            break;
          case "MC": //Miscellaneous contraindication
            return { Code: "medication", Display: "Medication", System: CodeSystem };
            break;
          case "PA": //Plant
            return { Code: "biologic", Display: "Biologic", System: CodeSystem };
            break;
          default:
            throw "The Allergy Intolerance Category Code typicaly found in AL1-2 was not an expected, the value was : " + oV2Code.Code;
        }
        break;
      }
    }



  }
}
