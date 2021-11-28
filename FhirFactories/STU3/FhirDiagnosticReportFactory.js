function FhirDiagnosticReportFactory() {

    this.GetResource = function (oReport, 
        SendingFacilityCode, 
        SendingApplicationCode, 
        oPatientResourceReference, 
        oProcedureRequestResourceReference, 
        oOrderingPractitionerResourceReference, 
        oPrincipalResultInterpreterResourceReference, 
        oObservationResourceList, 
        oFacilityConfig, 
        oTechnicianPractitionerResourceReference) {
      return new CreateDiagnosticReportResource(oReport, 
        SendingFacilityCode, 
        SendingApplicationCode, 
        oPatientResourceReference, 
        oProcedureRequestResourceReference, 
        oOrderingPractitionerResourceReference, 
        oPrincipalResultInterpreterResourceReference, 
        oObservationResourceList, 
        oFacilityConfig, 
        oTechnicianPractitionerResourceReference);
    };

    function CreateDiagnosticReportResource(oReport, 
        SendingFacilityCode, 
        SendingApplicationCode, 
        oPatientResourceReference, 
        oProcedureRequestResourceReference, 
        oOrderingPractitionerResourceReference, 
        oPrincipalResultInterpreterResourceReference, 
        oObservationResourceList, 
        oFacilityConfig, 
        oTechnicianPractitionerResourceReference) {
        
        var oFhirTool = new FhirTools();
        var oFhirDataType = new FhirDataTypeTool();
        var oConstant = new Constants();
        var oDiagReport = new DiagnosticReportFhirResource();        
  
        oDiagReport.SetId(oFhirTool.GetGuid());
        var XhtmlNarrative = null;
        if (SendingFacilityCode.toUpperCase() == oConstant.organization.dhm.name.toUpperCase()) {
          XhtmlNarrative = GetDiagnosticReportNarrative(oReport.DisplayDataLineList);
          var oNarrative = oFhirDataType.GetNarrative("additional", XhtmlNarrative)
          oDiagReport.SetText(oNarrative);
        } else if (oFacilityConfig.Implementation == ImplementationTypeEnum.CLINISEARCHRADIOLOGY) {
          //ToDo: Check we have the correct OBX and not just [0]
          if (oReport.ObservationList != null || oReport.ObservationList.length != 0) {
            XhtmlNarrative = GetDiagnosticReportNarrativeFromFT(oReport.ObservationList[oReport.ObservationList.length - 1].Value);
            var oNarrative = oFhirDataType.GetNarrative("additional", XhtmlNarrative)
            oDiagReport.SetText(oNarrative);
          } else {
            throw new Error("Unable to locate OBX segments under the " + ImplementationTypeEnum.CLINISEARCHRADIOLOGY + " messages' OBR segment.");
          }
        }
  
        
        oDiagReport.SetMetaProfile([oConstant.fhirResourceProfile.icims.diagnosticReport]);
        var oTypeCoding = oFhirDataType.GetCoding("FILL", "http://hl7.org/fhir/identifier-type", "Filler Identifier");
        var oType = oFhirDataType.GetCodeableConcept(oTypeCoding, "Report Identifier");
  
        var ReportIdentifier = null;
        if (SendingApplicationCode.toUpperCase() == oConstant.organization.sah.application.careZone.code.toUpperCase()) {
          ReportIdentifier = oFhirDataType.GetIdentifier("official", oType,
            oFhirTool.PreFixUuid(oConstant.organization.sah.application.epiSoft.codeSystem.FillerOrderNumber),
            oReport.FillerOrderNumberValue);
        } else if (SendingApplicationCode.toUpperCase() == oConstant.organization.sah.application.sanApps.code.toUpperCase()) {
          ReportIdentifier = oFhirDataType.GetIdentifier("official", oType,
            oFhirTool.PreFixUuid(oReport.FillerOrderNumberUniversalId.toLowerCase()),
            oReport.FillerOrderNumberValue);
        } else if (SendingApplicationCode.toUpperCase() == oConstant.organization.sah.application.radiationOncology.code.toUpperCase()) {
            ReportIdentifier = oFhirDataType.GetIdentifier("official", oType,
              oFhirTool.PreFixUuid(oConstant.organization.sah.application.radiationOncology.codeSystem.FillerOrderNumber),
              oReport.FillerOrderNumberValue);          
        } else if (oFacilityConfig.Implementation == ImplementationTypeEnum.CLINISEARCHPATHOLOGY) {
          if (SendingFacilityCode.toUpperCase() == oConstant.organization.dhm.name.toUpperCase()) {
            ReportIdentifier = oFhirDataType.GetIdentifier("official", oType,
              oConstant.organization.dhm.codeSystem.FillerOrderNumber,
              oReport.FillerOrderNumberValue);
          } else {
            throw new Error("Unable to resolve where the " + ImplementationTypeEnum.CLINISEARCHPATHOLOGY + " message has come to format the FillerOrderNumber.");
          }
        } else if (oFacilityConfig.Implementation == ImplementationTypeEnum.ICIMSPATHOLOGY) {
          if (SendingFacilityCode.toUpperCase() == oConstant.organization.dhm.name.toUpperCase()) {
            ReportIdentifier = oFhirDataType.GetIdentifier("official", oType,
              oConstant.organization.dhm.codeSystem.FillerOrderNumber,
              oReport.FillerOrderNumberValue);
          } else {
            throw new Error("Unable to resolve where the " + ImplementationTypeEnum.CLINISEARCHPATHOLOGY + " message has come to format the FillerOrderNumber.");
          }  
        } else if (oFacilityConfig.Implementation == ImplementationTypeEnum.CLINISEARCHRADIOLOGY) {
          if (SendingFacilityCode.toUpperCase() == oConstant.organization.sah.application.sanUSForWomen.sendingFacilityCode.toUpperCase()) {
            ReportIdentifier = oFhirDataType.GetIdentifier("official", oType,
              oConstant.organization.sah.application.sanUSForWomen.codeSystem.FillerOrderNumber,
              oReport.FillerOrderNumberValue);
          } else if (SendingFacilityCode.toUpperCase() == oConstant.organization.sah.application.sanRad.sendingFacilityCode.toUpperCase()) {
            ReportIdentifier = oFhirDataType.GetIdentifier("official", oType,
              oConstant.organization.sah.application.sanRad.codeSystem.FillerOrderNumber,
              oReport.FillerOrderNumberValue);
          } else {
            throw new Error("Unable to resolve where the CLINISEARCHRADIOLOGY message has come to format the FillerOrderNumber.");
          }
        } else {
          throw new Error("Unable to resolve where the message has come to format the FillerOrderNumber.");
        }
  
        oDiagReport.SetIdentifierArray([ReportIdentifier]);
          
        //This is the correct way to set the Requesting Practitioner
        if (oFacilityConfig.Implementation == ImplementationTypeEnum.ICIMSPATHOLOGY || 
          oFacilityConfig.Implementation == ImplementationTypeEnum.CLINISEARCHPATHOLOGY ||
          oFacilityConfig.Implementation == ImplementationTypeEnum.CLINISEARCHRADIOLOGY) {
          if (oProcedureRequestResourceReference != null) {
            oDiagReport.AddBasedOn(oProcedureRequestResourceReference);
          }
        }
  
        oDiagReport.SetStatus(oReport.Status);
  
        var oCategoryCoding = oFhirDataType.GetCoding(oReport.DiagServSectId, "http://hl7.org/fhir/v2/0074");
        var oCategoryCodeableConcept = oFhirDataType.GetCodeableConcept(oCategoryCoding, "Diagnostic Service Section Codes");
        oDiagReport.SetCategory(oCategoryCodeableConcept);
  
  
        
        var oCodeCoding = null;
        if ((oFacilityConfig.Implementation == ImplementationTypeEnum.CLINISEARCHPATHOLOGY || oFacilityConfig.Implementation == ImplementationTypeEnum.ICIMSPATHOLOGY) && SendingFacilityCode.toUpperCase() == oConstant.organization.dhm.name.toUpperCase()) {
          oCodeCoding = oFhirDataType.GetCoding(oReport.ReportCode, oConstant.organization.dhm.codeSystem.ReportPanel, oReport.ReportCodeDescription);
        } else if (oFacilityConfig.Implementation == ImplementationTypeEnum.CLINISEARCHRADIOLOGY) {
          if (SendingFacilityCode.toUpperCase() == oConstant.organization.sah.application.sanUSForWomen.sendingFacilityCode.toUpperCase()) {
            oCodeCoding = oFhirDataType.GetCoding(oReport.ReportCode, oConstant.organization.sah.application.sanUSForWomen.codeSystem.ReportPanel, oReport.ReportCodeDescription);
          } else if (SendingFacilityCode.toUpperCase() == oConstant.organization.sah.application.sanRad.sendingFacilityCode.toUpperCase()) {
            oCodeCoding = oFhirDataType.GetCoding(oReport.ReportCode, oConstant.organization.sah.application.sanRad.codeSystem.ReportPanel, oReport.ReportCodeDescription);
          } else {
            throw new Error("Unable to determine the correct ReportPanel system for the SendingFacilityCode of " + SendingFacilityCode);
          }
        } else if (SendingApplicationCode.toUpperCase() == oConstant.organization.sah.application.radiationOncology.code.toUpperCase()) {
          oCodeCoding = oFhirDataType.GetCoding(oReport.ReportCode, oConstant.organization.sah.application.radiationOncology.codeSystem.ReportPanel, oReport.ReportCodeDescription);
        }
        else {
          if (oReport.ReportCode == null && oReport.ReportCodeDescription != null) {
            oCodeCoding = oFhirDataType.GetCoding(undefined, undefined, oReport.ReportCodeDescription);
          } else {
            oCodeCoding = oFhirDataType.GetCoding(oReport.ReportCode, "http://loinc.org", oReport.ReportCodeDescription);
          }
        }
  
        var oCodeCodeableConcept = oFhirDataType.GetCodeableConcept(oCodeCoding);
        oDiagReport.SetCode(oCodeCodeableConcept);
        oDiagReport.SetSubject(oPatientResourceReference);
      
        //EffectivePeriod: e.g CollectionDate from OBR-7 (a.ka.ObserationStartDateTime) and maybe ObservationEndDateTime from OBR-8
        if (SendingApplicationCode.toUpperCase() == oConstant.organization.sah.application.radiationOncology.code.toUpperCase()) {
          oDiagReport.SetEffectivePeriodDateTime(oFhirTool.FhirDateTimeFormat(oReport.CollectionDateTime.AsXML), oFhirTool.FhirDateTimeFormat(oReport.ObservationEndDateTime.AsXML));
        }
        else{
          oDiagReport.SetEffectiveDateTime(oFhirTool.FhirDateTimeFormat(oReport.CollectionDateTime.AsXML));
        }
  
        
        oDiagReport.SetIssued(oFhirTool.FhirDateTimeFormat(oReport.ReportIssuedDateTime.AsXML));
  
  
        //For RadiationOncology messages  add the Technician as a Performer
        if (SendingApplicationCode.toUpperCase() == oConstant.organization.sah.application.radiationOncology.code.toUpperCase()) {
          if (oTechnicianPractitionerResourceReference != null){                   
            var oTechnicianPerformerRoleCoding = oFhirDataType.GetCoding("3430008", "http://snomed.info/sct", "Radiation therapist");
            oTechnicianPerformerRoleCodeableConcept = oFhirDataType.GetCodeableConcept(oTechnicianPerformerRoleCoding, undefined);          
            oDiagReport.AddPerformer(oTechnicianPerformerRoleCodeableConcept, oTechnicianPractitionerResourceReference);
          }
        }
  
        //Add Performer Practitioner which is incorrect if this is a Requesting Practitioner   
        if (oFacilityConfig.Implementation != ImplementationTypeEnum.CLINISEARCHRADIOLOGY) {
          if (oFacilityConfig.Implementation != ImplementationTypeEnum.CLINISEARCHPATHOLOGY) {
            if (oFacilityConfig.Implementation != ImplementationTypeEnum.ICIMSPATHOLOGY) {
              if (oOrderingPractitionerResourceReference != null) {
                var oOrderingPerformerRoleCodeableConcept = undefined;
                if (SendingApplicationCode.toUpperCase() == oConstant.organization.sah.application.careZone.code.toUpperCase()) {
                  var oOrderingPerformerRoleCoding = oFhirDataType.GetCoding("310512001", "http://snomed.info/sct", "Medical oncologist");
                  oOrderingPerformerRoleCodeableConcept = oFhirDataType.GetCodeableConcept(oOrderingPerformerRoleCoding, undefined);
                }
                oDiagReport.AddPerformer(oOrderingPerformerRoleCodeableConcept, oOrderingPractitionerResourceReference);
              }
            }
          }
        }
          
        if (oFacilityConfig.Implementation == ImplementationTypeEnum.CLINISEARCHRADIOLOGY && oPrincipalResultInterpreterResourceReference != null) {
          var oResultInterpreterPerformerRoleCoding = oFhirDataType.GetCoding("78729002", "http://snomed.info/sct", "Diagnostic radiologist");
          var oResultInterpreterPerformerRoleCodeableConcept = oFhirDataType.GetCodeableConcept(oResultInterpreterPerformerRoleCoding, undefined);
          oDiagReport.AddPerformer(oResultInterpreterPerformerRoleCodeableConcept, oPrincipalResultInterpreterResourceReference)
        }
  
        //Add All the DiagnosticReportObservationResourceList References to the DiagnosticReport Resource
        var ResultReferenceArray = [];
        for (var i = 0; (i < oObservationResourceList.length); i++) {
          var oObsReference = oFhirDataType.GetReference("Observation", oObservationResourceList[i].id, oObservationResourceList[i].code.coding.display);
          ResultReferenceArray.push(oObsReference);
        }
        if (ResultReferenceArray.length > 0) {
          oDiagReport.SetResult(ResultReferenceArray);
        }
  
        // //Get the base64 encoded PDF from the ObservationList and add to the DiagnosticReport Resource
        // //property named 'presentedForm'
        // if (oModels.FacilityConfig.SendPathologyPdfReport) {
        //   for (var i = 0; (i < oModels.DiagnosticReport.ObservationList.length); i++) {
        //     if (oV2Obs.Code == "PDF" && oV2Obs.CodeSystem == "AUSPDI") {
        //       var oPdfAttachment = oFhirDataType.GetPdfAttachment(oV2Obs.Value);
        //       oDiagReport.SetPresentedForm([oPdfAttachment]);
        //       break;
        //     }
        //   }
        // }
  
        return oDiagReport
      }

      function GetDiagnosticReportNarrative(DisplayLineList) {
        var oStringSupport = new StringSupport();
        var output = "<div xmlns=\"http://www.w3.org/1999/xhtml\">\n  <pre>"
        for (var i = 0; (i < DisplayLineList.length); i++) {
          output = output + oStringSupport.XMLEscape(DisplayLineList[i]) + "\n";
        }
        output = output + "  </pre>\n</div>";
        return output;
      }
  
      function GetDiagnosticReportNarrativeFromFT(FormattedText) {
        var oStringSupport = new StringSupport();
        var output = "<div xmlns=\"http://www.w3.org/1999/xhtml\">\n  <pre>"
        var BRSplit = FormattedText.split("\\.br\\");
        for (var i = 0; (i < BRSplit.length); i++) {
          output = output + oStringSupport.XMLEscape(BRSplit[i]) + "\n";
        }
        output = output.replace(/\\H\\/g, "<b>").replace(/\\N\\/g, "</b>");//HL7 V2 Highligh Off (Normal Text on)
        output = output + "  </pre>\n</div>";
        return output;
      }
}
