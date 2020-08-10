<% include $repo$\V2Libaray\HL7V2Support.js %>
<% include $repo$\ICIMS\Practitioner.js %>
<% include $repo$\Support\StringSupport.js %>
<% include $repo$\Support\ArraySupport.js %>

  function BusinessModels(SiteContext) {
    this.FacilityConfig = null;
    this.Action = null;
    this.Patient = null;
    this.Doctor = null;
    this.DiagnosticReport = null;
    this.Merge = null;
    this.MergeIdentifers = null;
    this.Meta = null;

    this.FacilityConfiguration = function () {
      this.FacilityConfig = new FacilityConfiguration(SiteContext);
      return this.FacilityConfig;
    };

    this.DiagnosticReportOruMessage = function (oHL7) {
      this.DiagnosticReport = new DiagnosticReport(oHL7, this.FacilityConfig);
      return this.Pathology;
    };

    this.AddMessage = function (oHL7) {
      this.Action = IcimsPostAction.Add;
      this.Patient = new Patient(oHL7.Segment("PID", 0), this.FacilityConfig);

      //Doctor
      if (this.FacilityConfig.SiteContext == SiteContextEnum.RMH) {
        var oROL_GP = ResolveGeneralPractitionerROL(oHL7);
        if (oROL_GP !== null) {
          this.Doctor = new Doctor(oROL_GP);
        }
      }

      //Meta-data
      this.Meta = new Meta(this.Action, oHL7.Segment("MSH", 0));
    };

    this.UpdateMessage = function (oHL7) {
      this.Action = IcimsPostAction.Update;
      this.Patient = null;
      this.Doctor = null;
      this.Meta = null;
      this.Patient = new Patient(oHL7.Segment("PID", 0), this.FacilityConfig);

      //Doctor
      if (this.FacilityConfig.SiteContext == SiteContextEnum.RMH) {
        var oROL_GP = ResolveGeneralPractitionerROL(oHL7);
        if (oROL_GP !== null) {
          this.Doctor = new Doctor(oROL_GP);
        }
        else {
          this.Doctor = null;
        }
      }
      this.Meta = new Meta(this.Action, oHL7.Segment("MSH", 0));
    };

    this.MergeMessage = function (oHL7) {
      this.Action = IcimsPostAction.Merge;
      this.Patient = new Patient(oHL7.Segment("PID", 0), this.FacilityConfig);
      this.Meta = new Meta(this.Action, oHL7.Segment("MSH", 0));
      this.MergeIdentifers = new MergeIdentifers(oHL7.Segment("MRG", 0), this.FacilityConfig);
    };


    function FacilityConfiguration(SiteContext) {

      // The static action name required by ICIMS for AddPatient requests.*/
      this.SiteContext = SiteContext;

      //Implementation is a code that represent what the interface is used for, this is to split
      //between Sonic DHM, Theater and CareZone 
      this.Implementation = null;

      // The Assigning Authority code used by the site for its primary Medical Record Number in HL7 V2 Messages */
      this.PrimaryMRNAssigningAuthority = null;

      // The Uri code used by the site for its primary Medical Record Number in FHIR Identifiers*/
      this.PrimaryMRNSystemUri = null;

      // The REST endpoint url for ICIMS.*/
      this.EndPoint = null;

      // The REST endpoint Operation Name for ICIMS.*/
      this.OperationName = null;

      // The REST endpoint url for ICIMS.*/
      this.SendPathologyPdfReport = false;

      // The static Authorization Token to make the REST call against ICIMS service. */
      this.AuthorizationToken = null;

      // The name of the HL7 Connect interface this script is triggered from */
      this.NameOfInterfaceRunningScript = null;

      // The number of Reject counts before the interface will stop, these are the red errors on the HL7Connect status page    
      this.MaxRejectBeforeInterfaceStop = 20;
    }


    function GetSegmentsListForOBRIndex(oHL7, OBRIndex, TargetSegmentCode) {
      var List = [];
      if (oHL7.SegmentByIndex(OBRIndex).Code !== "OBR") {
        throw new Error("The GetSegmentsListForOBRIndex function was provided a segment index which did not resolve to an OBR segment. The segment found was : " + oHL7.SegmentByIndex(OBRIndex).Code);
      }
      //Loop forward from the OBR collecting each TargetSegment until we reach another OBR or ORC or the end of all segments
      for (var i = OBRIndex + 1; (i < oHL7.SegmentCount); i++) {
        if (oHL7.SegmentByIndex(i).Code === TargetSegmentCode) {
          List.push(oHL7.SegmentByIndex(i));
        } else if (oHL7.SegmentByIndex(i).Code === "OBR") {
          break;
        }
      }
      return List;
    }


    function DiagnosticReport(oHL7, FacilityConfig) {
      this.Meta = null;
      this.Patient = null;
      this.ReportList = [];

      //Meta-data
      this.Meta = new Meta("PathologyPost", oHL7.Segment("MSH", 0));

      //Patient
      this.Patient = new Patient(oHL7.Segment("PID", 0), FacilityConfig);
      Breakpoint;
      for (var i = 0; (i < oHL7.CountSegment("OBR")); i++) {
        //For each OBR collect the Observation Segments 
        var OBR = oHL7.Segment("OBR", i);
        var OBXList = new GetSegmentsListForOBRIndex(oHL7, OBR.SegmentIndex, "OBX");
        var DSPList = new GetSegmentsListForOBRIndex(oHL7, OBR.SegmentIndex, "DSP");

        //Report
        this.ReportList.push(new Report(oHL7.Segment("OBR", 0), OBXList, DSPList, FacilityConfig));
      }
    }


    function DiagnosticReportOLD(oHL7, FacilityConfig) {
      this.Meta = null;
      this.Patient = null;
      this.Report = null;
      this.ObservationList = null;
      this.OrderingPractitioner = null;
      this.DisplayDataLineList = null;
      this.ObservationList = null;

      //Meta-data
      this.Meta = new Meta("PathologyPost", oHL7.Segment("MSH", 0));

      //Patient
      this.Patient = new Patient(oHL7.Segment("PID", 0), FacilityConfig);

      //Patient
      this.Report = new Report(oHL7.Segment("OBR", 0), FacilityConfig);

      //Practitioner
      this.OrderingPractitioner = new Practitioner();
      this.OrderingPractitioner.InflateXCN(oHL7.Segment("OBR", 0).Field(16));

      if (FacilityConfig.Implementation == ImplementationTypeEnum.CliniSearchPathology) {
        var DSPList = oHL7.SegmentQuery("DSP");
        this.DisplayDataLineList = GetDisplayDataList(DSPList, FacilityConfig);
      } else {
        var OBXList = oHL7.SegmentQuery("OBX");
        this.ObservationList = GetObservationList(OBXList, FacilityConfig);
      }

    }

    //==============================================================================
    // Support Classes
    //==============================================================================

    function Patient(oSeg, FacilityConfig) {
      // The Medical Record Number value for the patient 
      this.PrimaryMrnValue = null;
      // The Medical Record Number's Assigning Authority code
      this.PrimaryMrnAssigningAuthority = null;
      // The Medicare Number value for the patient
      this.MedicareNumberValue = null;
      // The Patient's title (e.g Dr, Mr, Ms)  
      this.Title = null;
      // The Patient's given name 
      this.Given = null;
      // The Patient's family name 
      this.Family = null;
      // The Patient's name formated e.g MILLAR, Mr Angus 
      this.FormattedName = null;
      // The Patient's date or birth
      this.Dob = null;
      // The Patient's sex 
      this.Sex = null;
      // The Patient's address
      this.PatientAddress = null;
      // The Patient's email address 
      this.PatientEmail
      // The Patient's home contacts
      this.ContactHome = null;
      // The Patient's Business contacts
      this.ContactBusiness = null;
      // The Patient's Marital Status
      this.MaritalStatus = null;
      // The Patient's Language code
      this.Language = null;
      /** @property {string} Aboriginality - The Patient's ATSI Indigenous Status code value: <code>
        *  <li><b>1</b>: Aboriginal but not Torres Strait Islander Origin</li>
        *  <li><b>2</b>: Torres Strait Is. but not Aboriginal Origin</li>
        *  <li><b>3</b>: Both Aboriginal and Torres Strait Islander Origin</li>
        *  <li><b>4</b>: Neither Aboriginal nor Torres Strait Islander origin</li>
        *  <li><b>7</b>: Client refused to answer (Victorian HealthSmart value Only)</li>
        *  <li><b>8</b>: Question unable to be asked (Victorian HealthSmart value Only)</li>
        *  <li><b>9</b>: Not stated/ inadequately described</li></code>
      */
      this.Aboriginality = null;
      this.DeathIndicator = null;
      this.DeathDateTime = null;

      var V2Support = new HL7V2Support();

      if (oSeg.Code == "PID") {
        // Medical Record number value
        var MRN = new ResolveMrn(oSeg.Element(3), FacilityConfig);
        this.PrimaryMrnValue = MRN.Value;
        this.PrimaryMrnAssigningAuthority = MRN.AssigningAuthority;

        //Medicare Number value
        this.MedicareNumberValue = V2Support.Set(oSeg.Field(19));

        //Patient Name
        for (var i = 0; i <= ((oSeg.Field(5).RepeatCount) - 1); i++) {
          var oXPN = oSeg.Field(5).Repeats(i);
          if (oXPN.Component(7).AsString.toUpperCase() == "L") {
            this.Title = V2Support.Set(oXPN.Component(5));
            this.Given = V2Support.Set(oXPN.Component(2));
            this.Family = V2Support.Set(oXPN.Component(1));
          }
          else if (FacilityConfig.SiteContext == SiteContextEnum.SAH) {
            //SAH does not use NameType codes
            this.Title = V2Support.Set(oXPN.Component(5));
            this.Given = V2Support.Set(oXPN.Component(2));
            this.Family = V2Support.Set(oXPN.Component(1));
          }
        }

        if (this.Title != null && this.Given != null) {
          this.FormattedName = this.Family.toUpperCase() + ", " + this.Title + " " + this.Given;
        } else if (this.Title == null && this.Given != null) {
          this.FormattedName = this.Family.toUpperCase() + ", " + this.Given;
        } else {
          this.FormattedName = this.Family.toUpperCase();
        }


        //Patient Date of Birth
        //require: dd/mm/yyyy
        if (oSeg.Field(7).defined && oSeg.Field(7).AsString != "" && oSeg.Field(7).AsString.length >= 8) {
          try {
            this.Dob = DateAndTimeFromHL7(oSeg.Field(7).AsString);
          }
          catch (Exec) {
            throw new Error("Date of Birth in PID-7 can not be parsed as a Date or Date time, vaule was: " + oSeg.Field(7).AsString);
          }
        }
        else {
          this.Dob = null;
        }
        //Patient Sex
        this.Sex = V2Support.Set(oSeg.Field(8));

        if (this.Sex != null) {
          switch (this.Sex) {
            case "F":
              this.Gender = "female";
              break;
            case "M":
              this.Gender = "male";
              break;
            case "A":
              this.Gender = "other";
              break;
            case "N":
              this.Gender = "unknown";
              break;
            case "O":
              this.Gender = "other";
              break;
            case "U":
              this.Gender = "unknown";
              break;
            default:
              throw new Error("The Patient sex found in PID-8 was not expected, value is : " + oOBR.Field(25).AsString + ", allowed values are (F,M,A,N,O,U).");
          }
        }

        //Patient Marital Status
        this.MaritalStatus = V2Support.Set(oSeg.Field(16));

        //Patient Language
        if (oSeg.Field(15).AsString != "") {
          this.Language = V2Support.Set(oSeg.Field(15));
        }

        Breakpoint;
        //The Patient ATSI code value
        if (oSeg.Field(10).AsString != "" && oSeg.Field(10).ComponentCount > 1 && oSeg.Field(10).Component(1).AsString != "") {
          this.Aboriginality = V2Support.Set(oSeg.Field(10).Component(1));
        }

        //Patient Address
        //(1: Business, 2: Mailing Address, 3:Temporary Address, 4:ResidentialHome, 9: Not Specified)
        //ToDo: What to do is we don't first get 4:Residential/Home, do we look for others or send empty fields?

        //Collect the following addresses in this order.
        var AddressTypeArray = [];
        if (FacilityConfig.SiteContext == SiteContextEnum.RMH) {
          AddressTypeArray =
            [
              RMHAddressTypeEnum.ResidentialHome,
              RMHAddressTypeEnum.Business,
              RMHAddressTypeEnum.MailingAddress,
              RMHAddressTypeEnum.TemporaryAddress,
              RMHAddressTypeEnum.NotSpecified
            ];
        } else {
          var AddressTypeArray =
            [
              SAHAddressTypeEnum.Permanent,
              SAHAddressTypeEnum.Business,
              SAHAddressTypeEnum.Home,
              SAHAddressTypeEnum.Office,
              SAHAddressTypeEnum.Mailing,
              SAHAddressTypeEnum.CurrentoOrTemporary,
              SAHAddressTypeEnum.CountyOfOrigin,
              SAHAddressTypeEnum.Email
            ];
        }


        var oXADAdressTarget = null;
        if (FacilityConfig.Implementation == ImplementationTypeEnum.CliniSearchRadiology) {
          oXADAdressTarget = oSeg.Field(11);
        } else {
          var Dic = ResolveAddressTypeFromXADList(oSeg.Field(11), AddressTypeArray);
          for (var AddressType in AddressTypeArray) {
            if (Dic.Exists(AddressTypeArray[AddressType])) {
              oXADAdressTarget = Dic.Item(AddressTypeArray[AddressType]);
              break;
            }
          }

          //Email Address For SAH
          if (FacilityConfig.SiteContext == SiteContextEnum.SAH) {
            if (Dic.Exists(SAHAddressTypeEnum.Email)) {
              var oXADEmailAdressTarget = Dic.Item(SAHAddressTypeEnum.Email);
              this.PatientEmail = V2Support.Set(oXADEmailAdressTarget.Component(1));
            }
            else {
              this.PatientEmail = "";
            }
          }
        }

        this.PatientAddress = new Address(oXADAdressTarget);


        this.ContactHome = new Contact();
        this.ContactBusiness = new Contact();
        if (FacilityConfig.SiteContext == SiteContextEnum.SAH) {
          this.ContactHome.InflateBasic(oSeg.Field(13));
          this.ContactBusiness.InflateBasic(oSeg.Field(14));
        }
        else if (FacilityConfig.SiteContext == SiteContextEnum.RMH) {
          this.ContactHome.Inflate(oSeg.Field(13), PhoneUseEnum.Primary);
          this.ContactBusiness.Inflate(oSeg.Field(14), PhoneUseEnum.Work);
        }

        if (FacilityConfig.SiteContext == SiteContextEnum.SAH) {
          if (oSeg.Field(29).defined && oSeg.Field(29).AsString != "" && oSeg.Field(29).AsString.length >= 8) {
            try {
              this.DeathDateTime = DateAndTimeFromHL7(oSeg.Field(29).AsString);
            }
            catch (Exec) {
              throw new Error("Date of Death in PID-29 can not be parsed as a Date or Date time, vaule was: " + oSeg.Field(7).AsString);
            }
          }
        }

        if (FacilityConfig.SiteContext == SiteContextEnum.SAH) {
          if (oSeg.Field(30).defined && oSeg.Field(30).AsString != "") {
            {
              if (oSeg.Field(30).AsString.toUpperCase() === "Y") {
                this.DeathIndicator = true;
              }
              else if (oSeg.Field(30).AsString.toUpperCase() === "N") {
                this.DeathIndicator = false;
              }
            }
          }
        }

      }
    }


    function Report(oOBR, OBXList, DSPList, oFacilityConfig) {

      this.FillerOrderNumberValue = null;
      this.FillerOrderNumberNamespaceId = null;
      this.FillerOrderNumberUniversalId = null;
      this.Status = null;
      this.DiagServSectId = null;

      this.ReportCode = null;
      this.ReportCodeDescription = null;
      this.ReportCodeSystem = null;

      this.CollectionDateTime = null;
      this.ReportIssuedDateTime = null;
      this.OrderingPractitioner = null;
      this.ObservationList = [];
      this.DisplayDataLineList = [];

      var V2Support = new HL7V2Support();

      this.FillerOrderNumberValue = V2Support.Set(oOBR.Field(3).Component(1));
      this.FillerOrderNumberNamespaceId = V2Support.Set(oOBR.Field(3).Component(2));
      this.FillerOrderNumberUniversalId = V2Support.Set(oOBR.Field(3).Component(3));

      //OrderingPractitioner
      this.OrderingPractitioner = new Practitioner();
      this.OrderingPractitioner.InflateXCN(oOBR.Field(16));

      //Get the Observations and DisplayDataLineList
      if (oFacilityConfig.Implementation == ImplementationTypeEnum.CliniSearchPathology) {
        this.DisplayDataLineList = GetDisplayDataList(DSPList, oFacilityConfig);
      } else {
        this.ObservationList = GetObservationList(OBXList, oFacilityConfig);
      }


      switch (oOBR.Field(25).AsString) {
        case "F":
          this.Status = "final";
          break;
        case "C":
          this.Status = "corrected";
          break;
        case "P":
          this.Status = "preliminary";
          break;
        case "X":
          this.Status = "cancelled";
          break;
        default:
          throw new Error("The Report status found in OBR-25 was not expected, value is : " + oOBR.Field(25).AsString);
      }

      this.DiagServSectId = V2Support.Set(oOBR.Field(24));

      this.ReportCode = V2Support.Set(oOBR.Field(4).Component(1));
      this.ReportCodeDescription = V2Support.Set(oOBR.Field(4).Component(2));
      this.ReportCodeSystem = V2Support.Set(oOBR.Field(4).Component(3));

      try {
        this.CollectionDateTime = DateAndTimeFromHL7(oOBR.Field(7).AsString);
      }
      catch (Exec) {
        throw new Error("Collection Date & Time in OBR-7 can not be parsed as a Date or Date time, vaule was: " + oOBR.Field(7).AsString);
      }

      try {
        this.ReportIssuedDateTime = DateAndTimeFromHL7(oOBR.Field(22).AsString);
      }
      catch (Exec) {
        throw new Error("Results Rpt/Status Change Date & Time in OBR-22 can not be parsed as a Date or Date time, vaule was: " + oOBR.Field(22).AsString);
      }
    }



    function ReportOLD(oOBR) {
      this.FillerOrderNumberValue = null;
      this.FillerOrderNumberNamespaceId = null;
      this.FillerOrderNumberUniversalId = null;
      this.Status = null;
      this.DiagServSectId = null;

      this.ReportCode = null;
      this.ReportCodeDescription = null;
      this.ReportCodeSystem = null;

      this.CollectionDateTime = null;
      this.ReportIssuedDateTime = null;

      var V2Support = new HL7V2Support();

      this.FillerOrderNumberValue = V2Support.Set(oOBR.Field(3).Component(1));
      this.FillerOrderNumberNamespaceId = V2Support.Set(oOBR.Field(3).Component(2));
      this.FillerOrderNumberUniversalId = V2Support.Set(oOBR.Field(3).Component(3));

      switch (oOBR.Field(25).AsString) {
        case "F":
          this.Status = "final";
          break;
        case "C":
          this.Status = "corrected";
          break;
        case "P":
          this.Status = "preliminary";
          break;
        case "X":
          this.Status = "cancelled";
          break;
        default:
          throw new Error("The Report status found in OBR-25 was not expected, value is : " + oOBR.Field(25).AsString);
      }

      this.DiagServSectId = V2Support.Set(oOBR.Field(24));

      this.ReportCode = V2Support.Set(oOBR.Field(4).Component(1));
      this.ReportCodeDescription = V2Support.Set(oOBR.Field(4).Component(2));
      this.ReportCodeSystem = V2Support.Set(oOBR.Field(4).Component(3));

      try {
        this.CollectionDateTime = DateAndTimeFromHL7(oOBR.Field(7).AsString);
      }
      catch (Exec) {
        throw new Error("Collection Date & Time in OBR-7 can not be parsed as a Date or Date time, vaule was: " + oOBR.Field(7).AsString);
      }

      try {
        this.ReportIssuedDateTime = DateAndTimeFromHL7(oOBR.Field(22).AsString);
      }
      catch (Exec) {
        throw new Error("Results Rpt/Status Change Date & Time in OBR-22 can not be parsed as a Date or Date time, vaule was: " + oOBR.Field(22).AsString);
      }
    }

    //Loops through each DSP segment collating the display lines into an array
    function GetDisplayDataList(DSPList, oFacilityConfig) {
      var DisplayDataLineList = [];
      for (var i = 0; (i < DSPList.length); i++) {
        if (DSPList[i].Field(2).AsString == "1") {
          DisplayDataLineList.push(DSPList[i].Field(3).AsString);
        } else {
          throw new Error("Encountered a Display Level in DSP-2 that is not equal to 1. This interface can only manage a single Display Level of 1.");
        }
      }
      return DisplayDataLineList;
    }


    //Loops through each OBX segment and creates an array of Observation object instances
    function GetObservationList(OBXList, oFacilityConfig) {
      var ObservationList = [];
      for (var i = 0; (i < OBXList.length); i++) {
        if (oFacilityConfig.SiteContext == SiteContextEnum.SAH && OBXList[i].Field(2).AsString == "XCN" && OBXList[i].Field(3).Component(1).AsString == "LS") {
          //Custom logic for SAH
          SahOBXLeadSurgeonProcessing(ObservationList, OBXList[i]);
        } else {
          var obs = new Observation(OBXList[i]);
          if (obs.Code != null)
            ObservationList.push(obs);
        }
      }
      return ObservationList;
    }

    function SahOBXLeadSurgeonProcessing(ObservationList, oOBX) {
      //SAH send the Lead Surgeon's Provider number and Name elements as a HL7 V2 XCN
      //DataType. As FHIR as no akin datatype for Observations we here split 
      //the one OBX into two, one for the Provider number and one for the Name.
      oOBX.Field(2).AsString = "ST";
      oOBX.Field(3).Component(1).AsString = "LSP";
      oOBX.Field(3).Component(2).AsString = "Lead Surgeon Provider Number";
      var FamilyName = oOBX.Field(5).Component(2).AsString;
      var GivenName = oOBX.Field(5).Component(3).AsString;
      var obsProv = new Observation(oOBX);
      ObservationList.push(obsProv);
      oOBX.Field(3).Component(1).AsString = "LSN";
      oOBX.Field(3).Component(2).AsString = "Lead Surgeon Name";
      oOBX.Field(5).Component(1).AsString = FamilyName + ", " + GivenName;
      var obsName = new Observation(oOBX);
      ObservationList.push(obsName);
    }


    //Parse an OBX segment to an Observation instance
    function Observation(oOBX) {
      this.Index = null;
      this.DataType = null;
      this.Code = null;
      this.CodeDescription = null;
      this.CodeSystem = null;
      this.SubId = null;
      this.Value = null;
      this.Units = null;
      this.ReferenceRangeText = null;
      this.InterpretationCode = null;
      this.InterpretationDesciption = null;
      this.Status = null;
      this.ObsDateTime = null;

      var V2Support = new HL7V2Support();

      if (!oOBX.Field(3).Component(1).defined) {
        if (oOBX.Field(5).defined) {
          throw new Error("There is an OBX Segment that has an empty OBX-3.1 yet OBX-5 is populated. If we have a result value in OBX-5 then we must have a code in OBX-3.1 to tell us what the result value is.");
        }
      } else {

        if (!oOBX.Field(2).defined && oOBX.Field(5).defined) {
          throw new Error("There is an OBX Segment that has an empty OBX-2 (DataType) and yet a populated OBX-5 result value. We must know the datatype to process the result value.");
        }

        this.Index = V2Support.Set(oOBX.Field(1));
        this.DataType = V2Support.Set(oOBX.Field(2));

        if (oOBX.Field(3).defined) {
          this.Code = V2Support.Set(oOBX.Field(3).Component(1));
          this.CodeDescription = V2Support.Set(oOBX.Field(3).Component(2));
          this.CodeSystem = V2Support.Set(oOBX.Field(3).Component(3));
        }

        this.SubId = V2Support.Set(oOBX.Field(4));

        //OBX-2 DataType
        if (this.DataType.toUpperCase() == "ED" && this.Code.toUpperCase() == "PDF") {
          this.Value = V2Support.Set(oOBX.Field(5).Component(5));
        } else if (this.DataType.toUpperCase() == "ST" && this.Code == "LS" && this.CodeDescription == "Lead Surgeon") {
          //This is a hack just for SAN
          var ProviderNumber = V2Support.Set(oOBX.Field(5).Component(1));
          var FamilyName = V2Support.Set(oOBX.Field(5).Component(2));
          var GivenName = V2Support.Set(oOBX.Field(5).Component(3));
          this.Value = ProviderNumber + "^" + FamilyName + "^" + GivenName;
        } else {
          this.Value = V2Support.Set(oOBX.Field(5));
        }

        //Units
        if (oOBX.Field(6).AsString != "") {
          this.Units = V2Support.Set(oOBX.Field(6));
        }

        //ReferenceRangeText
        if (oOBX.Field(7).AsString != "") {
          this.ReferenceRangeText = V2Support.Set(oOBX.Field(7));
        }

        //Interpretation (Abnormal Flag)
        if (oOBX.Field(8).AsString != "") {
          this.Interpretation = V2Support.Set(oOBX.Field(8));
        }
        if (oOBX.Field(8).AsString != "") {
          switch (oOBX.Field(8).AsString.toUpperCase()) {
            case "N":
              this.InterpretationCode = oOBX.Field(8).AsString.toUpperCase();
              this.InterpretationCode = "Normal";
              break;
            case "L":
              this.InterpretationCode = oOBX.Field(8).AsString.toUpperCase();
              this.InterpretationCode = "Low";
              break;
            case "LL":
              this.InterpretationCode = oOBX.Field(8).AsString.toUpperCase();
              this.InterpretationCode = "Critically low";
            case "H":
              this.InterpretationCode = oOBX.Field(8).AsString.toUpperCase();
              this.InterpretationCode = "High";
              break;
            case "HH":
              this.InterpretationCode = oOBX.Field(8).AsString.toUpperCase();
              this.InterpretationCode = "Critically high";
              break;
            case "A":
              this.InterpretationCode = oOBX.Field(8).AsString.toUpperCase();
              this.InterpretationCode = "Abnormal";
              break;
            case "AA":
              this.InterpretationCode = oOBX.Field(8).AsString.toUpperCase();
              this.InterpretationCode = "Critically abnormal";
              break;
            case "R":
              this.InterpretationCode = oOBX.Field(8).AsString.toUpperCase();
              this.InterpretationCode = "Resistant";
              break;
            case "S":
              this.InterpretationCode = oOBX.Field(8).AsString.toUpperCase();
              this.InterpretationCode = "Susceptible";
              break;
            case "I":
              this.InterpretationCode = oOBX.Field(8).AsString.toUpperCase();
              this.InterpretationCode = "Intermediate";
              break;
            default:
              throw new Error("The Observation abnormal status found in OBX-8 of the OBX segment index " + this.Index + " was not expected, value is : " + oOBX.Field(8).AsString + ", allowed values are (N,L,LL,H,HH,A,R,S,I).");
          }
        }


        //OBX-11 Observation Status
        if (oOBX.Field(11).AsString != "") {
          switch (oOBX.Field(11).AsString) {
            case "F":
              this.Status = "final";
              break;
            case "C":
              this.Status = "amended";
              break;
            case "P":
              this.Status = "preliminary";
            case "D":
              this.Status = "entered-in-error";
              break;
            default:
              throw new Error("The Observation status found in OBX-11 of the OBX segment index " + this.Index + " was not expected, value is : " + oOBX.Field(11).AsString + ", allowed values are (F,C,D,P).");
          }
        }

        //OBX-14 Observation DateTime perfomred
        if (oOBX.Field(14).AsString != "") {
          try {
            this.ObsDateTime = DateAndTimeFromHL7(oOBX.Field(14).AsString);
          }
          catch (Exec) {
            throw new Error("Observation Date & Time in OBX-14 for OBX index " + this.Index + " can not be parsed as a Date or Date time, vaule was: " + oOBX.Field(14).AsString);
          }
        }
      }
    }

    function Doctor(oROL) {
      /** @property {string} Given - The Doctor's given name*/
      this.Given = null;
      /** @property {string} Family - The Doctor's family name*/
      this.Family = null;
      /** @property {Address} Address - The Doctor's address */
      this.Address = null;
      /** @property {Contact} Contact - The Doctor's home contacts*/
      this.Contact = null;

      var V2Support = new HL7V2Support();

      this.Given = V2Support.Set(oROL.Field(4).Component(3));
      this.Family = V2Support.Set(oROL.Field(4).Component(2));

      //Doctor Address
      //(1: Business, 2: Mailing Address, 3:Temporary Address, 4:Residential/Home, 9: Not Specified)
      //At RMH we had issues in that we got many addresses and could not pick the one required for the current primary doctor surgery
      //This was resolved and the PMI is to now only send a single address that being the correct address.
      //For this reason I have changes the code below to just take the first address regardless of there being many, which there should not be.

      //BreakPoint;

      //If we did not get the target adddress then just take the first address.
      if (oROL.Field(11).RepeatCount > 0) {
        this.Address = new Address(oROL.Field(11).Repeats(0));
      }

      //Doctor Contacts (We only take the first of each type.
      this.Contact = new Contact();
      this.Contact.Inflate(oROL.Field(12), PhoneUseEnum.Work);


    }

    function Meta(Action, oMSH) {
      // The ICIMS request action string 
      this.Action = Action;
      // The HL7 V2 message unquie id 
      this.MessageControlID = null;
      // The HL7 V2 message creation Date Time
      this.MessageDateTime = null;
      // The HL7 V2 message SendingApplication MSH-3
      this.SendingApplication = null;
      // The HL7 V2 message SendingFacility MSH-4
      this.SendingFacility = null;

      var V2Support = new HL7V2Support();

      if (oMSH.Code !== "MSH") {
        throw new Error("Meta Hl7 Segment oMSH must have the segment code 'MSH'.");
      }
      this.MessageControlID = V2Support.Set(oMSH.Field(10));

      try {
        this.MessageDateTime = DateAndTimeFromHL7(oMSH.Field(7).AsString);
      }
      catch (Exec) {
        throw new Error("Message Date & Time in MSH-7 can not be parsed as a Date or Date time, vaule was: " + oMSH.Field(7).AsString);
      }

      this.SendingApplication = V2Support.Set(oMSH.Field(3));
      this.SendingFacility = V2Support.Set(oMSH.Field(4));
    }

    function MergeIdentifers(oMRG, FacilityConfig) {
      this.PriorMRNValue = null;
      this.PriorMRNAssigningAuthority = null;

      var MRN = new ResolveMrn(oMRG.Element(1), FacilityConfig);
      this.PriorMRNValue = MRN.Value;
      this.PriorMRNAssigningAuthority = MRN.AssigningAuthority;
    }

    function Address(oXAD) {
      //AddressLine1 - Address line one
      this.AddressLine1 = null;
      //AddressLine2 - Address line two
      this.AddressLine2 = null;
      //Address's suburb
      this.Suburb = null;
      //Address's state
      this.State = null;
      //Address's postcode
      this.Postcode = null;
      //The whole address formatted into one line
      this.FormattedAddress = null;

      var V2Support = new HL7V2Support();

      if (oXAD !== null) {
        this.AddressLine1 = V2Support.Set(oXAD.Component(1));
        this.AddressLine2 = V2Support.Set(oXAD.Component(2));
        this.Suburb = V2Support.Set(oXAD.Component(3));
        this.State = V2Support.Set(oXAD.Component(4));
        this.Postcode = V2Support.Set(oXAD.Component(5));
      }

      if (this.AddressLine1 != null) {
        this.FormattedAddress = this.AddressLine1;
      }
      if (this.AddressLine2 != null) {
        this.FormattedAddress = this.FormattedAddress + ", " + this.AddressLine2;
      }
      if (this.Suburb != null) {
        this.FormattedAddress = this.FormattedAddress + ", " + this.Suburb;
      }
      if (this.Postcode != null) {
        this.FormattedAddress = this.FormattedAddress + " " + this.Postcode;
      }
      if (this.State != null) {
        this.FormattedAddress = this.FormattedAddress + " " + this.State;
      }

    }

    function Contact() {
      // Phone number list 
      this.Phone = [];
      //Mobile number list 
      this.Mobile = [];
      //Email address list
      this.Email = [];
      //Fax number list 
      this.Fax = [];

      var V2Support = new HL7V2Support();

      this.InflateBasic = function (Element) {
        if (Element.Component(1).AsString != "") {
          if (Element.Component(1).AsString.substring(0, 2) == "04") {
            this.Mobile.push(V2Support.Set(Element.Component(1)));
          }
          else {
            this.Phone.push(V2Support.Set(Element.Component(1)));
          }
        }
      }

      this.Inflate = function (Element, UseType) {
        for (var i = 0; i <= ((Element.RepeatCount) - 1); i++) {
          //Primary Phone
          var oXTN = Element.Repeats(i);
          if (oXTN.Component(2).AsString.toUpperCase() == UseType &&
            oXTN.Component(3).AsString.toUpperCase() == PhoneEquipmentTypeEnum.Telephone) {
            this.Phone.push(V2Support.Set(oXTN.Component(1)));
          }
          //Primary Mobile
          if (oXTN.Component(2).AsString.toUpperCase() == UseType &&
            oXTN.Component(3).AsString.toUpperCase() == PhoneEquipmentTypeEnum.Mobile) {
            this.Mobile.push(V2Support.Set(oXTN.Component(1)));
          }
          //Primary Fax
          if (oXTN.Component(2).AsString.toUpperCase() == UseType &&
            oXTN.Component(3).AsString.toUpperCase() == PhoneEquipmentTypeEnum.FacsimileMachine) {
            this.Fax.push(V2Support.Set(oXTN.Component(1)));
          }
          //Primary Email (Correct Version) e.g ^NET^INTERNET^info@westgatemedical.com.au
          if (oXTN.Component(2).AsString.toUpperCase() == PhoneUseEnum.EmailAddress &&
            oXTN.Component(3).AsString.toUpperCase() == PhoneEquipmentTypeEnum.Internet) {
            this.Email.push(V2Support.Set(oXTN.Component(4)));
          }
          //Primary Email (Incorrect Version on Patients at RMH) e.g angus.millar@iinet.net.au^PRN^NET
          if (oXTN.Component(2).AsString.toUpperCase() == UseType &&
            oXTN.Component(3).AsString.toUpperCase() == PhoneUseEnum.EmailAddress) {
            this.Email.push(V2Support.Set(oXTN.Component(1)));
          }
        }
      }
    }


    //------------------------------------------------------------------------------
    // Private Methods, tools, enums
    //------------------------------------------------------------------------------


    // Enum of all knowen AddressTypes at RMH  
    var RMHAddressTypeEnum = {
      /** 1 */
      Business: 1,
      /** 2 */
      MailingAddress: 2,
      /** 3 */
      TemporaryAddress: 3,
      /** 4 */
      ResidentialHome: 4,
      /** 9 */
      NotSpecified: 9
    };


    // Enum of all knowen HL7 Table 0190 AddressTypes
    var SAHAddressTypeEnum = {
      /** B */
      Business: "B",
      /** C */
      CurrentoOrTemporary: "C",
      /** F */
      CountyOfOrigin: "F",
      /** H */
      Home: "H",
      /** M */
      Mailing: "M",
      /** O */
      Office: "O",
      /** P */
      Permanent: "P",
      /** E */
      Email: "E"
    };

    //Enum of all knowen PhoneUse at RMH, Component 2   
    var PhoneUseEnum = {
      /** ASN */
      AnsweringService: "ASN",
      /** BPN */
      Beeper: "BPN",
      /** NET */
      EmailAddress: "NET",
      /** EMR */
      Emergency: "EMR",
      /** ORN */
      Other: "ORN",
      /** PRN */
      Primary: "PRN",
      /** TTY */
      Teletype: "TTY",
      /** VHN */
      Vacation: "VHN",
      /** WPN */
      Work: "WPN"
    };


    // Enum of all knowen PhoneUse at RMH, Component    
    var PhoneEquipmentTypeEnum = {
      /** FX */
      FacsimileMachine: "FX",
      /** INTERNET */
      Internet: "INTERNET",
      /** CP */
      Mobile: "CP",
      /** MD */
      Modem: "MD",
      /** BP */
      Pager: "BP",
      /** PH */
      Telephone: "PH",
      /** TTY */
      Teletype: "TTY"
    };


    // Looks for the MRN with the given AssigningAuthorityCode and no end date
    // if none is found yet a 'MR' is found with no AssigningAuthority with no end date
    // then this MRN is assumed to be for the AssigningAuthority we are looking for.
    function ResolveMrn(oElement, FacilityConfig) {
      //The Medical Record Number value 
      this.Value = null;
      //The Medical Record Number's Assigning Authority code 
      this.AssigningAuthority = null;

      var V2Support = new HL7V2Support();

      var FirstMRValue = "";
      var FirstMRAssigningAuthority = "";
      for (var i = 0; i <= ((oElement.RepeatCount) - 1); i++) {
        var oCX = oElement.Repeats(i);
        //SAH messages have no AssigningAuthority only a number
        if (FacilityConfig.SiteContext == SiteContextEnum.SAH) {
          this.Value = V2Support.Set(oCX.Component(1));
          this.AssigningAuthority = FacilityConfig.PrimaryMRNAssigningAuthority;
        }
        else if (oCX.Component(5).AsString.toUpperCase() == "MR" &&
          oCX.Component(4).AsString.toUpperCase() == FacilityConfig.PrimaryMRNAssigningAuthority &&
          oCX.Component(8).AsString == "") {
          this.Value = V2Support.Set(oCX.Component(1));
          this.AssigningAuthority = V2Support.Set(oCX.Component(4));
        }
        else if (oCX.Component(5).AsString.toUpperCase() == "MR" &&
          oCX.Component(8).AsString == "" &&
          FirstMRValue == "") {
          FirstMRValue = V2Support.Set(oCX.Component(1));
          FirstMRAssigningAuthority = V2Support.Set(oCX.Component(4));
        }
      }
      if (FirstMRValue !== "" && FirstMRAssigningAuthority == null) {
        //We found no MRN Value for the given Assigning Auth of RMH so
        //take the first Value of MR type as long as it had no Assigning Auth
        // and asume it ids RMH
        this.Value = FirstMRValue;
        this.AssigningAuthority = AssigningAuthorityCode;
      }
    }


    // Function to find the correct HL7 V2 Role (ROL) segment for the Patient's General Practitioner information
    function ResolveGeneralPractitionerROL(oHL7) {
      for (var i = 0; (i < oHL7.CountSegment("ROL")); i++) {
        //ToDo: Check with Gita about codes in ROL-9.1, which codes to look for and can we get many of the same type
        // for the target we want GP?
        //Also what to do if we get not GP ROL segment
        //ROL-3.1 (Provider Role) = AP: Authoring Provider, CP:Consulting Doctor, RT:Discharged to/Referring provider, RP:Discharging/Referring provider, IR:Intended Recipient, PP:Primary Provider General Practitioner)
        //ROL-9.1= GMPRC: General Practitioner
        var ProviderRole = "PP";
        var ProviderType = "GMPRC";
        if (oHL7.Segment("ROL", i).Field(3).Component(1).AsString.toUpperCase() == ProviderRole &&
          oHL7.Segment("ROL", i).Field(9).Component(1).AsString.toUpperCase() == ProviderType) {
          return oHL7.Segment("ROL", i);
        }
      }
      return null;
    }


    // Get the first XAD element from the Adress List that matches the AddressTypeArray given.
    // returns a Dictonary of all the first instances found for each
    // (1: Business, 2: Mailing Address, 3:Temporary Address, 4:Residential/Home, 9: Not Specified)
    function ResolveAddressTypeFromXADList(oField, AddressTypeArray) {
      var Dic = new ActiveXObject("Scripting.Dictionary");
      for (var AddressType in AddressTypeArray) {
        for (var i = 0; i <= ((oField.RepeatCount) - 1); i++) {
          var oXAD = oField.Repeats(i);
          if (oXAD.Component(7).AsString.toUpperCase() == AddressTypeArray[AddressType]) {
            Dic.Add(AddressTypeArray[AddressType], oXAD);
            break;
          }
        }
      }
      return Dic;
    }


    // //We want the HL7 Nulls |""| within the Business module because we later apply logic to them for ICIMS
    // function Set(Content) {
    //   if (Content.IsNull)
    //     return "\"\"";
    //   else if (Content.AsString != "")
    //     return Content.AsString;
    //   else
    //     return null;
    // }

  }