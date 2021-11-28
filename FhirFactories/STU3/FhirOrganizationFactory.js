function FhirOrganizationFactory() {

    this.GetResource = function (ResourceId, OrganizationName, OrganizationAliasNameList) {
      return new CreateOrganizationResource(ResourceId, OrganizationName, OrganizationAliasNameList);
    };

    function CreateOrganizationResource(ResourceId, OrganizationName, OrganizationAliasNameList) {
      var oConstant = new Constants();
      var oOrg = new OrganizationFhirResource();
      oOrg.SetId(ResourceId);
      oOrg.SetMetaProfile(["http://hl7.org.au/fhir/StructureDefinition/au-organisation", oConstant.fhirResourceProfile.icims.organization]);
      oOrg.SetName(OrganizationName);
      oOrg.SetAlias(OrganizationAliasNameList);
      return oOrg;
    }

}





