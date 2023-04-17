<% include $repo$\FhirLibrary\STU3\Resource.js %>
<% include $repo$\FhirLibrary\STU3\DomainResource.js %>
<% include $repo$\FhirLibrary\STU3\BundleFhirResource.js %>
<% include $repo$\FhirLibrary\STU3\MessageHeaderFhirResource.js %>
<% include $repo$\FhirLibrary\STU3\OrganizationFhirResource.js %>
<% include $repo$\FhirLibrary\STU3\DiagnosticReportFhirResource.js %>
<% include $repo$\FhirLibrary\STU3\PatientFhirResource.js %>
<% include $repo$\FhirLibrary\STU3\ObservationFhirResource.js %>
<% include $repo$\FhirLibrary\STU3\ProvenanceFhirResource.js %>
<% include $repo$\FhirLibrary\STU3\PractitionerFhirResource.js %>
<% include $repo$\FhirLibrary\STU3\ProcedureRequestFhirResource.js %>
<% include $repo$\FhirLibrary\STU3\FhirDataTypeTool.js %>
<% include $repo$\FhirLibrary\STU3\FhirTools.js %>
<% include $repo$\FhirLibrary\STU3\FhirConstants.js %>
<% include $repo$\FhirFactories\STU3\FhirMessageHeaderFactory.js %>
<% include $repo$\FhirFactories\STU3\FhirPatientFactory.js %>
<% include $repo$\FhirFactories\STU3\FhirPractitionerFactory.js %>
<% include $repo$\FhirFactories\STU3\FhirProcedureRequestFactory.js %>
<% include $repo$\FhirFactories\STU3\FhirObservationFactory.js %>
<% include $repo$\FhirFactories\STU3\FhirDiagnosticReportFactory.js %>
<% include $repo$\FhirFactories\STU3\FhirOrganizationFactory.js %>
<% include $repo$\FhirFactories\STU3\FhirProvenanceFactory.js %>
<% include $repo$\FhirFactories\STU3\FhirBundleFactory.js %>
<% include $repo$\ICIMS\Constants.js %>

  function FhirResourceFactory() {

    this.CreateDiagnosticReportBundle = function (oModels) {
      return new CreateDiagnosticReportBundle(oModels);
    };

    function CreateDiagnosticReportBundle(oModels) {

      var oFhirDataType = new FhirDataTypeTool();
      var oConstant = new Constants();
      var oFhirConstants = new FhirConstants();

      BreakPoint;

      var BundleLogical = {
        MessageHeaderResource: null,
        PatientResource: null,
        OrganizationResourceList: [],
        PractitionerResourceList: [],
        DiagnosticReportLogicalList: [],
        ProvenanceResource: null
      }

      //MessageHeader Resource      
      var oFhirMessageHeaderFactory = new FhirMessageHeaderFactory();
      BundleLogical.MessageHeaderResource = oFhirMessageHeaderFactory.GetResource(oModels.DiagnosticReport.Meta, oModels.FacilityConfig);
    
      //Patient Resource   
      var oFhirPatientFactory = new FhirPatientFactory(); 
      BundleLogical.PatientResource = oFhirPatientFactory.GetResource(oModels.DiagnosticReport.Patient, oModels.FacilityConfig);      
      var oPatientResourceReference = oFhirDataType.GetReference(oFhirConstants.ResourceName.Patient, BundleLogical.PatientResource.id, oModels.DiagnosticReport.Patient.FormattedName);
      //========================================================================================================


      oFhirDiagnosticReportFactory = new FhirDiagnosticReportFactory();
      for (var r = 0; (r < oModels.DiagnosticReport.ReportList.length); r++) {
        var CurrentReport = oModels.DiagnosticReport.ReportList[r];

        var DiagnosticReportLogical = {
          DiagnosticReportResource: null,
          OrderingPractitionerResourceReference: null,
          PrincipalResultInterpreterPractitionerResourceReference: null,
          TechnicianPractitionerResourceReference: null,
          ProcedureRequestResource: null,
          ObservationResourceList: [],
          SubObservationResourceList: []
        }

        //Observation Resource       
        if (oModels.FacilityConfig.Implementation != ImplementationTypeEnum.CLINISEARCHPATHOLOGY) {
          if (oModels.FacilityConfig.Implementation != ImplementationTypeEnum.CLINISEARCHRADIOLOGY) {
            var DiagnosticReportLogical = FhirObservationListFactory(CurrentReport.ObservationList, CurrentReport.ReportIssuedDateTime, oPatientResourceReference, oModels.FacilityConfig, oModels.DiagnosticReport.Meta.SendingFacility);
          }
        }

        var oFhirPractitionerFactory = new FhirPractitionerFactory();

        //OrderingPractitioner Resource            
        if (CurrentReport.OrderingPractitioner != null)
        {
          var oTargetOrderingPractitionerResource = FindPractitionerResourceIdByIdentifier(BundleLogical.PractitionerResourceList, CurrentReport.OrderingPractitioner.Identifier, oConstant.organization.servicesAustralia.codeSystem.medicareProviderNumber);
          if (oTargetOrderingPractitionerResource == null) {
            //Both Agfa and Karisma at the SAM provide a Medicare Provider Number for the Ordering Provider (OBR-16)
            //However, Agfa does not provide an AssigningAuthority code (i.e AUSHICPR) to tell us this fact whereas Karisma does,
            //So this code is weak because we are just assuming they are providing a Medicare Provider number 

            oTargetOrderingPractitionerResource = oFhirPractitionerFactory.GetResource(CurrentReport.OrderingPractitioner, oConstant.organization.servicesAustralia.codeSystem.medicareProviderNumber);          
            if (oTargetOrderingPractitionerResource != null) {
              BundleLogical.PractitionerResourceList.push(oTargetOrderingPractitionerResource);
            }
          }
          if (oTargetOrderingPractitionerResource != null) {
            DiagnosticReportLogical.OrderingPractitionerResourceReference = oFhirDataType.GetReference(oFhirConstants.ResourceName.Practitioner, oTargetOrderingPractitionerResource.id, "Ordering Practitioner:" + CurrentReport.OrderingPractitioner.FormattedName);
          }
        }

        //PrincipalResultInterpreter Practitioner Resource        
        //Note that we had a message from the AGFA system which had no PrincipalResultInterpreter, many othr do have it though.
        if (CurrentReport.PrincipalResultInterpreter != null) {
          var oTargetPrincipalResultInterpreterPractitionerResource = null
          //For the PrincipalResultInterpreter we also do not get an AssigningAuthority to detect a Medicare Provider number so again we are making assumptions based on the messages seen 
          //For Agfa we appear to get a Medicare Provider number, yet for Karisma we only get a local code.
          //Also note that we are only adding a PrincipalResultInterpreterPractitionerResource for Radiology and not Pathology or the other Theatre or CareZone bundles
          if (oModels.DiagnosticReport.Meta.SendingFacility.toUpperCase() == oConstant.organization.sah.application.sanRad.sendingFacilityCode.toUpperCase()) {
            //Check we have not already generated a PractitionerResource for this Practitioner
            oTargetPrincipalResultInterpreterPractitionerResource = FindPractitionerResourceIdByIdentifier(BundleLogical.PractitionerResourceList, CurrentReport.PrincipalResultInterpreter.Identifier, oConstant.organization.servicesAustralia.codeSystem.medicareProviderNumber);
            if (oTargetPrincipalResultInterpreterPractitionerResource == null) {
              oTargetPrincipalResultInterpreterPractitionerResource = oFhirPractitionerFactory.GetResource(CurrentReport.PrincipalResultInterpreter, oConstant.organization.servicesAustralia.codeSystem.medicareProviderNumber);              
              BundleLogical.PractitionerResourceList.push(oTargetPrincipalResultInterpreterPractitionerResource);
            }
          } else if (oModels.DiagnosticReport.Meta.SendingFacility.toUpperCase() == oConstant.organization.sah.application.sanUSForWomen.sendingFacilityCode.toUpperCase()) {
            //Check we have not already generated a PractitionerResource for this Practitioner
            oTargetPrincipalResultInterpreterPractitionerResource = FindPractitionerResourceIdByIdentifier(BundleLogical.PractitionerResourceList, CurrentReport.PrincipalResultInterpreter.Identifier, oConstant.organization.sah.application.sanUSForWomen.codeSystem.provider);
            if (oTargetPrincipalResultInterpreterPractitionerResource == null) {
              oTargetPrincipalResultInterpreterPractitionerResource = oFhirPractitionerFactory.GetResource(CurrentReport.PrincipalResultInterpreter, oConstant.organization.sah.application.sanUSForWomen.codeSystem.provider);              
              BundleLogical.PractitionerResourceList.push(oTargetPrincipalResultInterpreterPractitionerResource);
            }
          }

          if (oTargetPrincipalResultInterpreterPractitionerResource != null) {
            DiagnosticReportLogical.PrincipalResultInterpreterPractitionerResourceReference = oFhirDataType.GetReference(oFhirConstants.ResourceName.Practitioner, oTargetPrincipalResultInterpreterPractitionerResource.id, "Principal Result Interpreter: " + CurrentReport.PrincipalResultInterpreter.FormattedName);
          }
        }
        
        if (CurrentReport.Technician != null){
          oTechnicianPractitionerResource = oFhirPractitionerFactory.GetResource(CurrentReport.Technician, oConstant.organization.servicesAustralia.codeSystem.medicareProviderNumber);          
          DiagnosticReportLogical.TechnicianPractitionerResourceReference = oFhirDataType.GetReference(oFhirConstants.ResourceName.Practitioner, oTechnicianPractitionerResource.id, "Radiation Oncologist : " + CurrentReport.Technician.FormattedName);          
          BundleLogical.PractitionerResourceList.push(oTechnicianPractitionerResource);
        }

        //ProcedureRequest Resource
        var oProcedureRequestResourceReference = null;
        if (oModels.FacilityConfig.Implementation == ImplementationTypeEnum.ICIMSPATHOLOGY || oModels.FacilityConfig.Implementation == ImplementationTypeEnum.CLINISEARCHPATHOLOGY || oModels.FacilityConfig.Implementation == ImplementationTypeEnum.CLINISEARCHRADIOLOGY) {
          oFhirProcedureRequestFactory = new FhirProcedureRequestFactory();
          DiagnosticReportLogical.ProcedureRequestResource = oFhirProcedureRequestFactory.GetResource(oPatientResourceReference, DiagnosticReportLogical.OrderingPractitionerResourceReference);
          var oProcedureRequestResourceReference = oFhirDataType.GetReference(oFhirConstants.ResourceName.ProcedureRequest, DiagnosticReportLogical.ProcedureRequestResource.id, oFhirConstants.ResourceName.ProcedureRequest);
        }


        //DiagnosticReport Resource       
        DiagnosticReportLogical.DiagnosticReportResource = oFhirDiagnosticReportFactory.GetResource(CurrentReport, oModels.DiagnosticReport.Meta.SendingFacility, 
                                                                                      oModels.DiagnosticReport.Meta.SendingApplication, oPatientResourceReference, oProcedureRequestResourceReference, 
                                                                                      DiagnosticReportLogical.OrderingPractitionerResourceReference, DiagnosticReportLogical.PrincipalResultInterpreterPractitionerResourceReference, 
                                                                                      DiagnosticReportLogical.ObservationResourceList, oModels.FacilityConfig, DiagnosticReportLogical.TechnicianPractitionerResourceReference);
        BundleLogical.DiagnosticReportLogicalList.push(DiagnosticReportLogical);
      }

      
      var FocusReferenceArray = [];
      for (var k = 0; (k < BundleLogical.DiagnosticReportLogicalList.length); k++) {
        FocusReferenceArray.push(oFhirDataType.GetReference(oFhirConstants.ResourceName.DiagnosticReport, BundleLogical.DiagnosticReportLogicalList[k].DiagnosticReportResource.id, oFhirConstants.ResourceName.DiagnosticReport));
      }
      BundleLogical.MessageHeaderResource.SetFocus(FocusReferenceArray);


      var oFhirOrganizationFactory = new FhirOrganizationFactory();
      //Icims Organization Resource
      BundleLogical.OrganizationResourceList.push(oFhirOrganizationFactory.GetResource(oConstant.organization.icims.id, oConstant.organization.icims.name, oConstant.organization.icims.aliasList));
      if (oModels.FacilityConfig.Implementation == ImplementationTypeEnum.CLINISEARCHPATHOLOGY) {
        //DHM Organization Resource
        BundleLogical.OrganizationResourceList.push(oFhirOrganizationFactory.GetResource(oConstant.organization.dhm.id, oConstant.organization.dhm.name, oConstant.organization.dhm.aliasList));
      } else {
        //SAH Organization Resource
        BundleLogical.OrganizationResourceList.push(oFhirOrganizationFactory.GetResource(oConstant.organization.sah.id, oConstant.organization.sah.name, oConstant.organization.sah.aliasList));
      }

      BreakPoint;
      //Provenance Resource
      var oFhirProvenanceFactory = new FhirProvenanceFactory()
      BundleLogical.ProvenanceResource = oFhirProvenanceFactory.GetResource(BundleLogical, oModels.DiagnosticReport.Meta.MessageControlID, oModels.FacilityConfig);

      //Bundle Resource
      var oFhirBundleFactory = new FhirBundleFactory();
      var oBundle = oFhirBundleFactory.GetResource(BundleLogical);

      return oBundle;
    }        

    function FhirObservationListFactory(oObservationList, oReportIssuedDateTime, oPatientResourceReference, oFacilityConfig, SendingFacility) {
      var oFhirTool = new FhirTools();
      var oConstant = new Constants();
      var oFhirConstants = new FhirConstants();
      var oFhirDataType = new FhirDataTypeTool();
      var oArraySupport = new ArraySupport();


      var oDiagnosticReportLogical = {
        DiagnosticReportResource: null,
        OrderingPractitionerResourceReference: null,
        PrincipalResultInterpreterPractitionerResourceReference: null,
        ProcedureRequestResource: null,
        ObservationResourceList: [],
        SubObservationResourceList: []
      }
      
      var SubIdProcessedArray = [];
      var oFhirObservationFactory = new FhirObservationFactory();
      for (var o = 0; (o < oObservationList.length); o++) {
        var oObservation = oObservationList[o];

        if (oFacilityConfig.Implementation == ImplementationTypeEnum.CLINISEARCHPATHOLOGY || oFacilityConfig.Implementation == ImplementationTypeEnum.ICIMSPATHOLOGY) {
          var ObsCategoryCoding = oFhirDataType.GetCoding("laboratory", "http://hl7.org/fhir/observation-category", "Laboratory");
        } else if (oFacilityConfig.Implementation == ImplementationTypeEnum.CLINISEARCHRADIOLOGY) {
          var ObsCategoryCoding = oFhirDataType.GetCoding("RAD", "http://hl7.org/fhir/observation-category", "Radiology");
        } else {
          var ObsCategoryCoding = oFhirDataType.GetCoding("procedure", "http://hl7.org/fhir/observation-category", "Procedure");
        }
        var ObsCategoryCodeableConcept = oFhirDataType.GetCodeableConcept(ObsCategoryCoding);

       
        if (oObservation.Code != "PDF" && oObservation.CodeSystem != "AUSPDI") {
          if (oObservation.SubId == null) {
            var oObservationResource = oFhirObservationFactory.GetResource(
              oObservation,
              oReportIssuedDateTime.AsXML,
              oPatientResourceReference,
              ObsCategoryCodeableConcept,
              SendingFacility);
            oDiagnosticReportLogical.ObservationResourceList.push(oObservationResource);
          } 
          else 
          {
            if (!oArraySupport.Contains(SubIdProcessedArray, oObservation.SubId)) {
              var oParentObservation = new ObservationFhirResource();
              oParentObservation.SetId(oFhirTool.GetGuid());
              oParentObservation.SetMetaProfile([oConstant.fhirResourceProfile.icims.observation]);
              var ObsCodeCoding = oFhirDataType.GetCoding(oObservation.SubId,
                "https://www.sah.org.au/systems/fhir/observation/procedure-observation", oObservation.SubId);
              var ObsCodeCodeableConcept = oFhirDataType.GetCodeableConcept(ObsCodeCoding);
              oParentObservation.SetCode(ObsCodeCodeableConcept);
              oParentObservation.SetSubject(oPatientResourceReference);
              var oSubIdObsGroup = oArraySupport.Filter(oObservationList, "SubId", oObservation.SubId);
              oDiagnosticReportLogical.ObservationResourceList.push(oParentObservation);
              for (var x = 0; (x < oSubIdObsGroup.length); x++) {
                var oSubObs = oSubIdObsGroup[x];
                var oSubObservation = oFhirObservationFactory.GetResource(oSubObs,
                  oReportIssuedDateTime.AsXML,
                  oPatientResourceReference,
                  ObsCategoryCodeableConcept,
                  SendingFacility);
                var oSubObservationReference = oFhirDataType.GetReference(oFhirConstants.ResourceName.Observation, oSubObservation.id, undefined);
                oParentObservation.AddRelated(oSubObservationReference, "has-member");
                oDiagnosticReportLogical.SubObservationResourceList.push(oSubObservation);
              }
              SubIdProcessedArray.push(oObservation.SubId);
            }
          }
        }
      }
      return oDiagnosticReportLogical;
    }    

    function FindPractitionerResourceIdByIdentifier(oPractitionerResourceList, IdentifierValue, IdentifierSystem) {
      for (var r = 0; (r < oPractitionerResourceList.length); r++) {
        if (oPractitionerResourceList[r].identifier != null && oPractitionerResourceList[r].identifier != undefined) {
          for (var i = 0; (i < oPractitionerResourceList[r].identifier.length); i++) {
            if (oPractitionerResourceList[r].identifier[i].system == IdentifierSystem) {
              if (oPractitionerResourceList[r].identifier[i].value == IdentifierValue) {
                return oPractitionerResourceList[r];
              }
            }
          }
        }
      }
      return null;
    }


  }