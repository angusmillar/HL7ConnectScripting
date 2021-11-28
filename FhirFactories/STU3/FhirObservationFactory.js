function FhirObservationFactory() {

    this.GetResource = function (oV2Obs, ReportIssuedDateTime, oPatientReference, ObsCategoryCodeableConcept, SendingFacility) {
      return new CreateObservationResource(oV2Obs, ReportIssuedDateTime, oPatientReference, ObsCategoryCodeableConcept, SendingFacility);
    };

    function CreateObservationResource(oV2Obs, ReportIssuedDateTime, oPatientReference, ObsCategoryCodeableConcept, SendingFacility) {        
        if (oV2Obs.DataType == "ST" || oV2Obs.DataType == "NM" || oV2Obs.DataType == "FT") {
            var oFhirTool = new FhirTools();
            var oConstant = new Constants();
            var oFhirDataType = new FhirDataTypeTool();
            var oObservation = new ObservationFhirResource();
    
            var ObservationId = oFhirTool.GetGuid();
            oObservation.SetId(ObservationId);
            oObservation.SetMetaProfile([oConstant.fhirResourceProfile.icims.observation]);
            oObservation.SetStatus(oV2Obs.Status);
            oObservation.SetCategory([ObsCategoryCodeableConcept]);
            var ObsCodeCoding = null;
    
            if (oV2Obs.CodeSystem != null && oV2Obs.CodeSystem.toUpperCase() == "LN") {
                ObsCodeCoding = oFhirDataType.GetCoding(oV2Obs.Code,
                "http://loinc.org", oV2Obs.CodeDescription);
            } else if (SendingFacility.toUpperCase() == oConstant.organization.dhm.name.toUpperCase())
            {
                ObsCodeCoding = oFhirDataType.GetCoding(oV2Obs.Code,oConstant.organization.dhm.codeSystem.Result, oV2Obs.CodeDescription);
            } else {
                ObsCodeCoding = oFhirDataType.GetCoding(oV2Obs.Code, "https://www.sah.org.au/systems/fhir/observation/procedure-observation", oV2Obs.CodeDescription);
            }
    
            var ObsCodeCodeableConcept = oFhirDataType.GetCodeableConcept(ObsCodeCoding);
            oObservation.SetCode(ObsCodeCodeableConcept);
    
            oObservation.SetSubject(oPatientReference);
            //Collection DateTime Clinically relevant date Time
            oObservation.SetEffectiveDateTime(oFhirTool.FhirDateTimeFormat(ReportIssuedDateTime));
            //Time off analyser, when the observation was observerd
            if (oV2Obs.ObsDateTime != null) {
                oObservation.SetIssued(oFhirTool.FhirDateTimeFormat(oV2Obs.ObsDateTime.AsXML));
            }
    
            //Abnormal Flag (Interpretation)
            if (oV2Obs.InterpretationCode != null) {
                var InterpCoding = oFhirDataType.GetCoding(oV2Obs.InterpretationCode, "http://hl7.org/fhir/v2/0078", oV2Obs.InterpretationDesciption);
                var InterpCodeableConcept = oFhirDataType.GetCodeableConcept(InterpCoding);
                oObservation.SetInterpretation(InterpCodeableConcept);
            }
            //The Result
            if (oV2Obs.DataType == "ST") {
                oObservation.SetValueString(oV2Obs.Value);
            } else if (oV2Obs.DataType == "FT") {
                //Here we strip any Formated Text formating and add Json line breaks in place of HL7 V2 breaks e.g (\.br\)
                var StripFormatting = oV2Obs.Value
                    .replace(/\\H\\/g, "") //HL7 V2 Highligh On
                    .replace(/\\N\\/g, "") //HL7 V2 Highligh Off (Normal Text on)
                    .replace(/\\.br\\/g, "\n") //HL7 V2 LineBreaks
                    .replace(/\\X0D\\/g, "\n"); //Carriage return
                oObservation.SetValueString(StripFormatting);
            } else if (oV2Obs.DataType == "NM") {
                oObservation.SetValueQuantity(oFhirDataType.GetQuantity(oV2Obs.Value, undefined, oV2Obs.Units, undefined, undefined));
                if (oV2Obs.ReferenceRangeText != null) {
                    var RangeTypeCodeCoding = oFhirDataType.GetCoding("normal",
                    "http://hl7.org/fhir/referencerange-meaning", "Normal Range");
                    var RangeTypeCodeCodeableConcept = oFhirDataType.GetCodeableConcept(RangeTypeCodeCoding);
                    oObservation.SetReferenceRange(undefined, undefined, RangeTypeCodeCodeableConcept, undefined, undefined, oV2Obs.ReferenceRangeText);
                }
            }
            return oObservation;
        } else {
            throw new Error("OBX DataType in OBX-2 of " + oV2Obs.DataType + " is not supported in the FHIR output.");
        }        
    }
}
