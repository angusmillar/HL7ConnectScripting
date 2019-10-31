
<% include $repo$\FhirLibrary\R4\FhirTools.js %>
<% include $repo$\FhirLibrary\R4\FhirConfig.js %>
<% include $repo$\FhirLibrary\R4\FhirDataTypeTool.js %>

<% include $repo$\FhirLibrary\R4\Resource.js %>
<% include $repo$\FhirLibrary\R4\DomainResource.js %>
<% include $repo$\FhirLibrary\R4\BundleFhirResource.js %>
<% include $repo$\FhirLibrary\R4\MessageHeaderFhirResource.js %>
<% include $repo$\FhirLibrary\R4\OrganizationFhirResource.js %>
<% include $repo$\FhirLibrary\R4\PatientFhirResource.js %>
<% include $repo$\FhirLibrary\R4\EncounterFhirResource.js %>
<% include $repo$\FhirLibrary\R4\ProvenanceFhirResource.js %>
<% include $repo$\FhirLibrary\R4\ConditionFhirResource.js %>
<% include $repo$\FhirLibrary\R4\AllergyIntoleranceFhirResource.js %>
<% include $repo$\FhirLibrary\R4\ParametersFhirResource.js %>

  function FhirResourceFactory(oModels) {

    var oFhirDataType = new FhirDataTypeTool();
    var oFhirConfig = new FhirConfig();
    var oFhirTool = new FhirTools();
    BreakPoint;
    var oHL7V2ToFhirMapping = new HL7V2ToFhirMapping(oModels.FacilityConfig, oFhirConfig);

    this.CreateADTBundle = function () {

      return new CreateADTBundle(oModels);
    };

    this.CreateMergePatientParameters = function () {

      return new CreateMergePatientParameters(oModels);
    };

    function CreateMergePatientParameters(oModels) {

      var ServivingPatientParameterName = "serviving";
      var NonServivingPatientParameterName = "non-serviving";

      //Parameters
      var oParam = new ParametersFhirResource();

      //Serviving Patient Resource
      var PatientId = oFhirTool.GetGuid();
      var oPatient = GetPatient(oModels, PatientId);
      var ServivingPatientParameter = oParam.GetParameter(ServivingPatientParameterName, undefined, undefined, oPatient, undefined);

      //Non Serviving Patient MRN Identifier
      var oPriorMRNTypeCoding = oFhirDataType.GetCoding("MR", "http://hl7.org/fhir/v2/0203", "Medical record number");
      var oPriorMRNType = oFhirDataType.GetCodeableConcept(oPriorMRNTypeCoding, "Medical record number");
      var oPriorMRNIdentifier = oFhirDataType.GetIdentifier("official", oPriorMRNType,
        oModels.FacilityConfig.PrimaryMRNSystemUri,
        oModels.Merge.PriorMrn.Value);
      var NonServivingPatientParameter = oParam.GetParameter(NonServivingPatientParameterName, "Identifier", oPriorMRNIdentifier, undefined, undefined);

      oParam.AddParameter(ServivingPatientParameter);
      oParam.AddParameter(NonServivingPatientParameter);

      return oParam;
    }

    function CreateADTBundle(oModels) {

      //Bundle
      var oBundle = new BundleFhirResource();
      oBundle.SetId(oFhirTool.GetGuid());
      oBundle.SetType("message");
      //var bundleProfileUrl = oFhirTool.PathCombine([IcimsProfileBase, IcimsMessageBundleProfileName]);
      //oBundle.SetMetaProfile([bundleProfileUrl]);

      var PatientId = oFhirTool.GetGuid();
      var PatientFormattedName = oFhirTool.FormattedHumanName(oModels.Patient.Family, oModels.Patient.Given, oModels.Patient.Title);
      var oPatientReference = oFhirDataType.GetReference(oFhirTool.PreFixUuid(PatientId), undefined, undefined, oFhirConfig.ResourceName.Patient + ": " + PatientFormattedName);

      //MessageHeader Resource      
      var MessageHeaderId = oModels.MessageHeader.MessageControlID;
      var oMsgHeader = GetMessageHeader(oModels, MessageHeaderId, oPatientReference);
      oBundle.AddEntry(oFhirTool.GetRelativeReference(oFhirConfig.ResourceName.MessageHeader, oMsgHeader.id), oMsgHeader);

      //Patient
      var oPatient = GetPatient(oModels, PatientId);
      oBundle.AddEntry(oFhirTool.PreFixUuid(PatientId), oPatient);

      //Encounter
      var EncounterId = oFhirTool.GetGuid();
      var oEncounter = GetEncounter(oModels, EncounterId, oPatientReference);
      oBundle.AddEntry(oFhirTool.PreFixUuid(EncounterId), oEncounter);

      //--------------------------------------------------------------------------
      //AllergyIntolerance
      //--------------------------------------------------------------------------
      //We have to add AllergyIntolerance as seperate resource rather than contined resources of the Encounter resource
      //because AllergyIntolerance resources reference Encounter and not the other way around.
      var oEncounterReference = oFhirDataType.GetReference(oFhirTool.PreFixUuid(oEncounter.id), undefined, undefined, oFhirConfig.ResourceName.Encounter + ": " + oModels.Encounter.EcounterNumber);
      for (var i = 0; (i < oModels.Encounter.AllergyList.length); i++) {
        oAllergy = oModels.Encounter.AllergyList[i];
        BreakPoint;
        oAllergyIntolerance = GetAllergyIntolerance(oAllergy, oPatientReference, oEncounterReference);
        oBundle.AddEntry(oFhirTool.PreFixUuid(oAllergyIntolerance.id), oAllergyIntolerance);
      }

      //Organizations
      if (oModels.FacilityConfig.Fhir.SendOrganizationResourceInBundle) {
        //Organization ICIMS        
        var oSenderOrg = GetOrganization(oModels.FacilityConfig.Fhir.SendingOrganizationResourceId, oModels.FacilityConfig.Fhir.SendingOrganizationName);
        oBundle.AddEntry(oFhirTool.GetRelativeReference(oFhirConfig.ResourceName.Organization, oSenderOrg.id), oSenderOrg);

        //Organization SAH        
        var oReceiverOrg = GetOrganization(oModels.FacilityConfig.Fhir.ReceivingOrganizationResourceId, oModels.FacilityConfig.Fhir.ReceivingOrganizationName);
        oBundle.AddEntry(oFhirTool.GetRelativeReference(oFhirConfig.ResourceName.Organization, oReceiverOrg.id), oReceiverOrg);
      }

      //Provenance
      var provenanceId = oFhirTool.GetGuid();
      var oProvenance = GetProvenance(provenanceId, oModels, oBundle);
      oBundle.AddEntry(oFhirTool.PreFixUuid(provenanceId), oProvenance);

      return oBundle;
    }

    function GetMessageHeader(oModels, MessageHeaderId, oPatientReference) {
      var oMsgHeader = new MessageHeaderFhirResource();
      oMsgHeader.SetId(MessageHeaderId);
      //var msgHeadProfileUrl = FhirTool.PathCombine([IcimsProfileBase, IcimsMessageHeaderProfileName], "/");
      //oMsgHeader.SetMetaProfile([msgHeadProfileUrl]);
      var HeaderEventCoding = oFhirDataType.GetCoding(oModels.MessageHeader.MessageType + oModels.MessageHeader.MessageEvent, oFhirConfig.HL7V2MessageTypeEventCodeSystemUri, "HL7 V2 Message Type Event");
      oMsgHeader.SetEventCoding(HeaderEventCoding);

      var oPyroServerDeviceReference = oFhirDataType.GetReference(oFhirTool.GetRelativeReference(oFhirConfig.ResourceName.Device, oFhirConfig.PyroServerDeviceResourceId), undefined, undefined, undefined);
      var oReceiverReference = oFhirDataType.GetReference(oFhirTool.GetRelativeReference(oFhirConfig.ResourceName.Organization, oModels.FacilityConfig.Fhir.ReceivingOrganizationResourceId), undefined, undefined, oModels.FacilityConfig.Fhir.ReceivingOrganizationName);
      oMsgHeader.SetDestination(oModels.FacilityConfig.Fhir.ReceivingOrganizationName, oPyroServerDeviceReference, oModels.FacilityConfig.Fhir.FhirEndpoint, oReceiverReference);

      var oSenderReference = oFhirDataType.GetReference(oFhirTool.GetRelativeReference(oFhirConfig.ResourceName.Organization, oModels.FacilityConfig.Fhir.SendingOrganizationResourceId), undefined, undefined, oModels.FacilityConfig.Fhir.SendingOrganizationName);
      oMsgHeader.SetSender(oSenderReference);
      oMsgHeader.SetSource(oModels.MessageHeader.SendingApplication);
      var messageheaderResponseRequestExtension = oFhirDataType.GetExtension("http://hl7.org/fhir/StructureDefinition/messageheader-response-request", "valueCode", "on-error");
      oMsgHeader.SetExtension(messageheaderResponseRequestExtension);
      oMsgHeader.SetFocus(oPatientReference);
      return oMsgHeader;
    }



    function GetPatient(oModels, PatientId) {
      //--------------------------------------------------------------------------
      //Patient Resource
      //--------------------------------------------------------------------------
      var oPatient = new PatientFhirResource();
      oPatient.SetId(PatientId);

      //var patientProfileUrl = oFhirTool.PathCombine([IcimsProfileBase, IcimsPatientProfileName], "/");
      //oPatient.SetMetaProfile(["http://hl7.org.au/fhir/StructureDefinition/au-patient", patientProfileUrl]);

      var PatientIdentifierArray = [];

      //MRN
      var oPatMrnTypeCoding = oFhirDataType.GetCoding("MR", "http://hl7.org/fhir/v2/0203", "Medical record number");
      var oPatMrnType = oFhirDataType.GetCodeableConcept(oPatMrnTypeCoding, "Medical record number");
      var MrnIdentifier = oFhirDataType.GetIdentifier("official", oPatMrnType,
        oModels.FacilityConfig.PrimaryMRNSystemUri,
        oModels.Patient.PrimaryMrnValue);
      PatientIdentifierArray.push(MrnIdentifier);

      //MedicareNumber
      if (oModels.Patient.MedicareNumberValue != null) {
        var oPatMedicareTypeCoding = oFhirDataType.GetCoding("MC", "http://hl7.org/fhir/v2/0203", "Medicare Number");
        var oPatMedicareType = oFhirDataType.GetCodeableConcept(oPatMedicareTypeCoding, "Medicare Number");
        var MedicareIdentifier = oFhirDataType.GetIdentifier("official", oPatMedicareType,
          oFhirConfig.MedicareNumberSystemUri,
          oModels.Patient.MedicareNumberValue);
        PatientIdentifierArray.push(MedicareIdentifier);
      }

      var PatientFormattedName = oFhirTool.FormattedHumanName(oModels.Patient.Family, oModels.Patient.Given, oModels.Patient.Title);
      oPatient.SetIdentifier(PatientIdentifierArray);
      var HumanName = oFhirDataType.GetHumanName("official",
        PatientFormattedName,
        oModels.Patient.Family,
        oModels.Patient.Given,
        oModels.Patient.Title);
      oPatient.SetName([HumanName]);
      oPatient.SetGender(oHL7V2ToFhirMapping.SexCodeToGenderCodeMap(oModels.Patient.Sex));
      oPatient.SetBirthDate(oFhirTool.RemoveTimeFromDataTimeString(oModels.Patient.Dob.AsXML));

      var FHIRAddressList = [];

      for (var i = 0; i < oModels.Patient.PatientAddressList.length; i++) {
        var PatientAddress = oModels.Patient.PatientAddressList[i];
        var lineArray = [];
        if (PatientAddress.AddressLine1 != null) {
          lineArray.push(PatientAddress.AddressLine1);
        }
        if (PatientAddress.AddressLine2 != null) {
          lineArray.push(PatientAddress.AddressLine2);
        }
        var oAddress = oFhirDataType.GetAddressAustrlian(undefined, undefined,
          lineArray, PatientAddress.Suburb, undefined, PatientAddress.Postcode);
        FHIRAddressList.push(oAddress);
      }

      oPatient.SetAddress(FHIRAddressList);


      //Next Of Kin as Contacts
      if (!oModels.IsPatientMerge) {
        for (var i = 0; i < oModels.Encounter.NextOfKinList.length; i++) {
          var oV2NextOfKin = oModels.Encounter.NextOfKinList[i];
          var oRelationshipCodeableConcept = undefined;
          if (oV2NextOfKin.Relationship != null) {
            var oRelationshipCoding = oFhirDataType.GetCoding(oV2NextOfKin.Relationship.Identifier, "http://hl7.org/fhir/v2/0203", oV2NextOfKin.Relationship.Text);
            oRelationshipCodeableConcept = oFhirDataType.GetCodeableConcept(oRelationshipCoding, undefined);
          }
          var oHumanName = undefined;
          if (oV2NextOfKin.Family != null) {
            var NOKFormattedName = oFhirTool.FormattedHumanName(oV2NextOfKin.Family, oV2NextOfKin.Given, oV2NextOfKin.Title);
            oHumanName = oFhirDataType.GetHumanName("official",
              NOKFormattedName,
              oV2NextOfKin.Family,
              oV2NextOfKin.Given,
              oV2NextOfKin.Title);
          }

          var oTelecomContactPointList = [];
          if (oV2NextOfKin.HomePhoneNumber != null) {
            oTelecomContactPointList.push(oFhirDataType.GetContactPoint("phone", oV2NextOfKin.HomePhoneNumber, "home", undefined, undefined));
          }
          if (oV2NextOfKin.WorkPhoneNumber != null) {
            oTelecomContactPointList.push(oFhirDataType.GetContactPoint("phone", oV2NextOfKin.WorkPhoneNumber, "work", undefined, undefined));
          }
          if (oTelecomContactPointList.length == 0) {
            oTelecomContactPointList = undefined;
          }

          var oAddress = undefined;
          if (oV2NextOfKin.Address != null) {
            var lineArray = [];
            if (oV2NextOfKin.Address.AddressLine1 != null) {
              lineArray.push(oV2NextOfKin.Address.AddressLine1);
            }
            if (oV2NextOfKin.Address.AddressLine2 != null) {
              lineArray.push(oV2NextOfKin.Address.AddressLine2);
            }

            var oAddress = oFhirDataType.GetAddressAustrlian(undefined, undefined,
              lineArray, oV2NextOfKin.Address.Suburb, oV2NextOfKin.Address.State, oV2NextOfKin.Address.Postcode);

            NextOfKinStartDate = null;
            NextOfKinEndDate = null;
            if (oV2NextOfKin.StartDate != null) {
              NextOfKinStartDate = oV2NextOfKin.StartDate.AsXML;
            }

            if (oV2NextOfKin.EndDate != null) {
              NextOfKinEndDate = oV2NextOfKin.EndDate.AsXML;
            }
            var oNOKPeriod = oFhirDataType.GetPeriod(oFhirTool.SetTimeZone(NextOfKinStartDate), oFhirTool.SetTimeZone(NextOfKinEndDate))
          }
          var NextOfKinGender = undefined;
          if (oV2NextOfKin.Sex != null) {
            NextOfKinGender = oHL7V2ToFhirMapping.SexCodeToGenderCodeMap(oV2NextOfKin.Sex);
          }
          oPatient.AddContact(oRelationshipCodeableConcept, oHumanName, oTelecomContactPointList, oAddress, NextOfKinGender, undefined, oNOKPeriod)
        }
      }
      return oPatient;
    }

    function GetEncounter(oModels, EncounterId, oPatientReference) {
      //--------------------------------------------------------------------------
      //Encounter 
      //--------------------------------------------------------------------------      

      var oEncounter = new EncounterFhirResource();
      oEncounter.SetId(EncounterId);


      var EncounterDiagnosisArray = [];
      var oConditionResourceArray = [];

      //The Encounter's contained Condition resources
      for (var i = 0; (i < oModels.Encounter.DiagnosisList.length); i++) {
        var oCondition = new ConditionFhirResource();
        oCondition.SetId("Condition" + (i + 1));
        var oCodeCoding = undefined;
        if (oModels.Encounter.DiagnosisList[i].Code.Identifier != "") {
          oCodeCoding = oFhirDataType.GetCoding(oModels.Encounter.DiagnosisList[i].Code.Identifier, oModels.FacilityConfig.Fhir.ConditionCodeSystemUri, oModels.Encounter.DiagnosisList[i].Code.Text);
        }
        var CodeText = oModels.Encounter.DiagnosisList[i].Description;
        var oCodeCodeableConcept = oFhirDataType.GetCodeableConcept(oCodeCoding, CodeText);
        oCondition.SetCode(oCodeCodeableConcept);
        var oCategoryCoding = oFhirDataType.GetCoding("encounter-diagnosis", "http://terminology.hl7.org/CodeSystem/condition-category", "Encounter Diagnosis");
        var oCategoryCodeableConcept = oFhirDataType.GetCodeableConcept(oCategoryCoding, "Admitting");
        oCondition.SetCategory(oCategoryCodeableConcept);

        var DateTime = oFhirTool.SetTimeZone(oModels.Encounter.DiagnosisList[i].DateTime.AsXML)
        oCondition.SetRecordedDate(DateTime);
        oConditionResourceArray.push(oCondition);


        //The below array EncounterDiagnosisArray is bulit here and then added to the Encounter resource Diagnosis property later 
        var oConditionReference = oFhirDataType.GetReference(oFhirTool.GetContainedReference(oCondition.id), undefined, undefined, oFhirConfig.ResourceName.Condition);
        var oDiagnosisUseCoding = oFhirDataType.GetCoding("AD", "http://terminology.hl7.org/CodeSystem/diagnosis-role", "Admission diagnosis");
        var oDiagnosisUseCodeableConcept = oFhirDataType.GetCodeableConcept(oDiagnosisUseCoding, undefined);
        EncounterDiagnosisArray.push({ Reference: oConditionReference, Use: oDiagnosisUseCodeableConcept, Rank: undefined })
      }

      if (oConditionResourceArray.length > 0) {
        oEncounter.SetContained(oConditionResourceArray);
      }

      if (oModels.Encounter.EcounterNumber != null) {
        var oEncounterNumIdentifier = oFhirDataType.GetIdentifier("official",
          undefined,
          oModels.FacilityConfig.Fhir.EncounterNumberSystemUri,
          oModels.Encounter.EcounterNumber);
        oEncounter.SetIdentifier([oEncounterNumIdentifier]);
      }

      var currentdatetime = new Date();
      //Admission and Discharge dates convert to status.
      if (oModels.Encounter.AdmissionDateTime != null) {
        if (oModels.Encounter.AdmissionDateTime <= currentdatetime) {
          if (oModels.Encounter.DischargeDateTime != null) {
            if (oModels.Encounter.DischargeDateTime >= currentdatetime) {
              oEncounter.SetStatus("in-progress");
            } else {
              oEncounter.SetStatus("finished");
            }
          } else {
            oEncounter.SetStatus("in-progress");
          }
        } else {
          //The Admin date must be earlier than now but is present, so planned.
          oEncounter.SetStatus("planned");
        }
      } else {
        //no Admin date but do we have a discharge date only, should not relay happen 
        //but this logic would be true if it did happen
        if (oModels.Encounter.DischargeDateTime != null) {
          if (oModels.Encounter.DischargeDateTime >= currentdatetime) {
            oEncounter.SetStatus("in-progress");
          } else {
            oEncounter.SetStatus("finished");
          }
        } else {
          oEncounter.SetStatus("in-progress");
        }
      }

      var oEcounterClassCoding = oFhirDataType.GetCoding(oModels.Encounter.Class.Code, oModels.Encounter.Class.System, oModels.Encounter.Class.Display);
      oEncounter.SetClass(oEcounterClassCoding);

      if (oPatientReference != undefined) {
        oEncounter.SetSubject(oPatientReference);
      }

      //Admission & Discharge dateTimes
      oEncounterPeriod = null;
      if (oModels.Encounter.AdmissionDateTime != null && oModels.Encounter.DischargeDateTime == null) {
        oEncounterPeriod = oFhirDataType.GetPeriod(oFhirTool.SetTimeZone(oModels.Encounter.AdmissionDateTime.AsXML), undefined)
        oEncounter.SetPeriod(oEncounterPeriod)
      } else if (oModels.Encounter.AdmissionDateTime == null && oModels.Encounter.DischargeDateTime != null) {
        oEncounterPeriod = oFhirDataType.GetPeriod(undefined, oFhirTool.SetTimeZone(oModels.Encounter.DischargeDateTime.AsXML))
        oEncounter.SetPeriod(oEncounterPeriod)
      } else if (oModels.Encounter.AdmissionDateTime != null && oModels.Encounter.DischargeDateTime != null) {
        oEncounterPeriod = oFhirDataType.GetPeriod(oFhirTool.SetTimeZone(oModels.Encounter.AdmissionDateTime.AsXML), oFhirTool.SetTimeZone(oModels.Encounter.DischargeDateTime.AsXML))
        oEncounter.SetPeriod(oEncounterPeriod)
      }

      for (var i = 0; (i < EncounterDiagnosisArray.length); i++) {
        oEncounter.AddDiagnosis(EncounterDiagnosisArray[i].Reference, EncounterDiagnosisArray[i].Use, EncounterDiagnosisArray[i].Rank);
      }

      //Locations (PointOfCare, Room, Bed, Facility, LocationDescription)
      if (oModels.Encounter.PointOfCare != null) {
        var oLocationReference = oFhirDataType.GetReference(undefined, undefined, undefined, oModels.Encounter.PointOfCare);
        var oPhysicalTypeCodeableConcept = oFhirDataType.GetCodeableConcept(undefined, "PointOfCare");
        oEncounter.AddLocation(oLocationReference, undefined, oPhysicalTypeCodeableConcept, undefined);
      }
      if (oModels.Encounter.Room != null) {
        var oLocationReference = oFhirDataType.GetReference(undefined, undefined, undefined, oModels.Encounter.Room);
        var oPhysicalTypeCoding = oFhirDataType.GetCoding("ro", "http://terminology.hl7.org/CodeSystem/location-physical-type", "Room");
        var oPhysicalTypeCodeableConcept = oFhirDataType.GetCodeableConcept(oPhysicalTypeCoding, "Room");
        oEncounter.AddLocation(oLocationReference, undefined, oPhysicalTypeCodeableConcept, undefined);
      }
      if (oModels.Encounter.Bed != null) {
        var oLocationReference = oFhirDataType.GetReference(undefined, undefined, undefined, oModels.Encounter.Bed);
        var oPhysicalTypeCoding = oFhirDataType.GetCoding("db", "http://terminology.hl7.org/CodeSystem/location-physical-type", "Bed");
        var oPhysicalTypeCodeableConcept = oFhirDataType.GetCodeableConcept(oPhysicalTypeCoding, "Bed");
        oEncounter.AddLocation(oLocationReference, undefined, oPhysicalTypeCodeableConcept, undefined);
      }
      if (oModels.Encounter.Facility != null) {
        var oLocationReference = oFhirDataType.GetReference(undefined, undefined, undefined, oModels.Encounter.Facility);
        var oPhysicalTypeCoding = oFhirDataType.GetCoding("si", "http://terminology.hl7.org/CodeSystem/location-physical-type", "site");
        var oPhysicalTypeCodeableConcept = oFhirDataType.GetCodeableConcept(oPhysicalTypeCoding, "Facility");
        oEncounter.AddLocation(oLocationReference, undefined, oPhysicalTypeCodeableConcept, undefined);
      }
      if (oModels.Encounter.LocationDescription != null) {
        var oLocationReference = oFhirDataType.GetReference(undefined, undefined, undefined, oModels.Encounter.LocationDescription);
        var oPhysicalTypeCodeableConcept = oFhirDataType.GetCodeableConcept(undefined, "LocationDescription");
        oEncounter.AddLocation(oLocationReference, undefined, oPhysicalTypeCodeableConcept, undefined);
      }
      return oEncounter;
    }

    function GetAllergyIntolerance(oHL7V2Allergy, oPatientReference, oEncounterReference) {
      var oAllergyIntolerance = new AllergyIntoleranceFhirResource();
      oAllergyIntolerance.SetId(oFhirTool.GetGuid());
      if (oHL7V2Allergy.TypeCode != null) {
        var CategoryCoding = oHL7V2ToFhirMapping.AllergyIntoleranceCategoryCodeMap(oHL7V2Allergy.TypeCode.Identifier);
        oAllergyIntolerance.SetCategory(CategoryCoding.Code)
      }
      if (oHL7V2Allergy.Code != null) {
        var oAllergyCoding = oFhirDataType.GetCoding(oHL7V2Allergy.Code.Identifier, oModels.FacilityConfig.Fhir.AllergyIntoleranceCodeSystemUri, oHL7V2Allergy.Code.Text);
        var oAllergyCodeableConcept = oFhirDataType.GetCodeableConcept(oAllergyCoding, oHL7V2Allergy.Code.Text);
        oAllergyIntolerance.SetCode(oAllergyCodeableConcept);
      }
      if (oHL7V2Allergy.IdentificationDate != null) {
        oAllergyIntolerance.SetOnSetDateTime(oHL7V2Allergy.IdentificationDate.AsXML)
      }
      if (oEncounterReference != undefined) {
        oAllergyIntolerance.SetEncounter(oEncounterReference);
      }
      if (oPatientReference != undefined) {
        oAllergyIntolerance.SetPatient(oPatientReference);
      }
      return oAllergyIntolerance;
    }

    function GetOrganization(OrganizationResourceId, OrganizationName) {
      var oOrg = new OrganizationFhirResource();
      oOrg.SetId(OrganizationResourceId);
      oOrg.SetName(OrganizationName);
      return oOrg;
    }

    function GetProvenance(provenanceId, oModels, oBundle) {
      var oProvenance = new ProvenanceFhirResource();
      oProvenance.SetId(provenanceId);
      //var oProvenanceProfileUrl = oFhirTool.PathCombine([IcimsProfileBase, IcimsProvenanceProfileName]);
      //oProvenance.SetMetaProfile([oProvenanceProfileUrl]);

      var TargetReferenceArray = [];
      for (var i = 0; i < oBundle.entry.length; i++) {
        var oEntry = oBundle.entry[i];
        var oResource = oBundle.entry[i].resource;
        TargetReferenceArray.push(oFhirDataType.GetReference(oEntry.fullUrl, oResource.resourceType, undefined, oResource.resourceType));
      }
      oProvenance.SetTarget(TargetReferenceArray);
      oProvenance.SetOccurredDateTime(oFhirTool.SetTimeZone(oModels.MessageHeader.MessageDateTime.AsXML));
      oProvenance.SetRecorded(oFhirTool.GetNow());

      var activityCoding = oFhirDataType.GetCoding("CREATE", "http://hl7.org/fhir/v3/DataOperation", "create");
      var activityCodeableConcept = oFhirDataType.GetCodeableConcept(activityCoding, undefined);
      oProvenance.SetActivity(activityCodeableConcept);

      var agentTypeCoding = oFhirDataType.GetCoding("custodian", "http://terminology.hl7.org/CodeSystem/provenance-participant-type", "custodian");
      var agentTypeCodeableConcept = oFhirDataType.GetCodeableConcept(agentTypeCoding, undefined);

      var whoReference = oFhirDataType.GetReference(undefined, undefined, undefined, "HL7 Connect Integration Engine");

      var onBehalfOfReference = oFhirDataType.GetReference(oFhirTool.GetRelativeReference(oFhirConfig.ResourceName.Organization, oModels.FacilityConfig.Fhir.ReceivingOrganizationResourceId), undefined, undefined, oModels.FacilityConfig.Fhir.ReceivingOrganizationName);
      oProvenance.SetAgent(agentTypeCodeableConcept, undefined, whoReference, onBehalfOfReference);

      var oMessageControlIdIdentifier = oFhirDataType.GetIdentifier("official", undefined,
        oModels.FacilityConfig.Fhir.HL7V2MessageControlIdSystemUri, oModels.MessageHeader.MessageControlID);
      var oWhatReference = oFhirDataType.GetReference(undefined, undefined, oMessageControlIdIdentifier, "HL7 V2 Message Control Id");
      oProvenance.SetEntity("source", oWhatReference);
      return oProvenance;
    }
  }