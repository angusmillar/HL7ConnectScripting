function FhirPatientFactory() {

    this.GetResource = function (oPatient, oFacilityConfig) {
      return new CreatePatientResource(oPatient, oFacilityConfig);
    };

    function CreatePatientResource(oPatient, oFacilityConfig) {
        var oFhirDataType = new FhirDataTypeTool();
        var oConstant = new Constants();
        var FhirTool = new FhirTools();
        var PatientId = FhirTool.GetGuid();
        var oPatientResource = new PatientFhirResource();
        oPatientResource.SetId(PatientId);
    
        oPatientResource.SetMetaProfile(["http://hl7.org.au/fhir/StructureDefinition/au-patient", oConstant.fhirResourceProfile.icims.patient]);
    
        var PatientIdentifierArray = [];
    
        //MRN
        if (oPatient.PrimaryMrnValue != null) {
          var oPatMrnTypeCoding = oFhirDataType.GetCoding("MR", "http://hl7.org/fhir/v2/0203", "Medical record number");
          var oPatMrnType = oFhirDataType.GetCodeableConcept(oPatMrnTypeCoding, "Medical record number");
          var MrnIdentifier = oFhirDataType.GetIdentifier("official", oPatMrnType,
            oFacilityConfig.PrimaryMRNSystemUri,
            oPatient.PrimaryMrnValue);
          PatientIdentifierArray.push(MrnIdentifier);
        }
        //MedicareNumber
        if (oPatient.MedicareNumberValue != null) {
          var oPatMedicareTypeCoding = oFhirDataType.GetCoding("MC", "http://hl7.org/fhir/v2/0203", "Medicare Number");
          var oPatMedicareType = oFhirDataType.GetCodeableConcept(oPatMedicareTypeCoding, "Medicare Number");
          var MedicareIdentifier = oFhirDataType.GetIdentifier("official", oPatMedicareType,
            "http://ns.electronichealth.net.au/id/medicare-number",
            oPatient.MedicareNumberValue);
          PatientIdentifierArray.push(MedicareIdentifier);
        }
    
        if (PatientIdentifierArray.length > 0) {
          oPatientResource.SetIdentifier(PatientIdentifierArray);
        }
    
        var HumanName = oFhirDataType.GetHumanName("official", oPatient.FormattedName,
          oPatient.Family,
          oPatient.Given,
          oPatient.Title);
        oPatientResource.SetName([HumanName]);
        oPatientResource.SetGender(oPatient.Gender);
        oPatientResource.SetBirthDate(oPatient.Dob.AsXML);
    
        var PatientAddress = oPatient.PatientAddress;
        var lineArray = [];
        if (PatientAddress.AddressLine1 != null) {
          lineArray.push(PatientAddress.AddressLine1);
        }
        if (PatientAddress.AddressLine2 != null) {
          lineArray.push(PatientAddress.AddressLine2);
        }
        if (PatientAddress.FormattedAddress != null) {
          var oAddress = oFhirDataType.GetAddressAustrlian(undefined, PatientAddress.FormattedAddress,
            lineArray, PatientAddress.Suburb, undefined, PatientAddress.Postcode);
          oPatientResource.SetAddress([oAddress]);
        }
    
        return oPatientResource;
    }

}





