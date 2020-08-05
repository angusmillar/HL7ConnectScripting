function FacilityFhirConfig() {

  this.FhirEndpoint = null;
  this.OperationNameProcessMessage = null;
  this.OperationNameMergePatient = null;
  this.AuthorizationToken = null;

  this.SendOrganizationResourceInBundle = false;
  this.SendingOrganizationResourceId = null;
  this.SendingOrganizationName = null;
  this.SendingOrganizationAliasArray = [];

  this.ReceivingOrganizationResourceId = null;
  this.ReceivingOrganizationName = null;
  this.ReceivingOrganizationAliasArray = [];

  this.HL7V2MessageControlIdSystemUri = null;
  this.EncounterNumberSystemUri = null;
  this.ConditionCodeSystemUri = null;
  this.AllergyIntoleranceCodeSystemUri = null;
}
