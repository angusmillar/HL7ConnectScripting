
function BusinessModels(SiteContext)
{
  this.FacilityConfig = null;
  this.Pathology = null;
  /**
   * @function
   * @description Creates a new FacilityConfiguration object instance
   * @public
   * @returns {FacilityConfiguration} object
  */
  this.FacilityConfiguration = function()
  {
    this.FacilityConfig = new FacilityConfiguration(SiteContext);
    return this.FacilityConfig;
  };

  /**
   * @function
   * @description Creates a new Add object instance
   * @param {message} oHL7 The inbound message object
   * @returns {Add} object
  */
  this.PathologyOruMessage = function(oHL7)
  {
    this.Pathology = new Pathology(oHL7, this.FacilityConfig);
    return this.Pathology;
  };

  
  /**
   * @class
   * @classdesc Internal Add class collects data required for the AddPatient requests
   * @constructor
   * @param {SiteContextEnum} SiteContext Site Context that the script is running under
   * @public
   * @inner
  */
  function FacilityConfiguration(SiteContext)
  {
    /** @property {string}  AddActionName - The static action name required by ICIMS for AddPatient requests.*/
    this.SiteContext = SiteContext;

    /** @property {string}  PrimaryMRNAssigningAuthority - The Assigning Authority code used by the site for its primary Medical Record Number */
    this.PrimaryMRNAssigningAuthority = null;

    /** @property {string}  EndPoint - The REST endpoint url for ICIMS.*/
    this.EndPoint = null;

    /** @property {string}  AuthorizationToken - The static Authorization Token to make the REST call against ICIMS service. */
    this.AuthorizationToken = null;
    
    /** @property {string}  NameOfInterfaceRunnningScript - The name of the HL7 Connect interface this script is triggered from */
    this.NameOfInterfaceRunnningScript = null;
    
    /** @property {integer}  MaxRejectBeforeInterfaceStop  - The number of Reject counts before the interface will stop, these are the red errors on the HL7Connect status page
     * @default  */
    this.MaxRejectBeforeInterfaceStop = 20;
  }

  /**
   * @class
   * @classdesc Internal Add class collects data required for the AddPatient requests
   * @constructor
   * @param {message} oHL7 The inbound message object
   * @inner
  */
  function Pathology(oHL7, FacilityConfig)
  {
    this.Meta = null;
    this.Patient = null;
    
    //Meta-data
    this.Meta = new Meta(oHL7.Segment("MSH",0));
    
    //Patient
    this.Patient = new Patient(oHL7.Segment("PID", 0), FacilityConfig);

  }
  
//==============================================================================
// Support Classes
//==============================================================================

  /**
   * @class
   * @classdesc Internal Patient class collects data required for the Patient
   * @constructor
   * @param {Segment} oSeg The HL7 V2 PID Patient Segment
   * @inner
  */
  function Patient(oSeg, FacilityConfig)
  {
    /** @property {string}  RMHMrnValue - The Medical Record Number value for the patient */
    this.RMHMrnValue = null;
    /** @property {string}  RMHMrnAssigningAuthority - The Medical Record Number's Assigning Authority code */
    this.RMHMrnAssigningAuthority = null;
    /** @property {string}  RMHMrnValue - The Medicare Number value for the patient */
    this.MedicareNumberValue = null;
    /** @property {string}  Given - The Patient's given name */
    this.Given = null;
    /** @property {string}  Faimly - The Patient's family name */
    this.Family = null;
    /** @property {date}  Dob - The Patient's date or birth */
    this.Dob = null;
    /** @property {char}  Dob - The Patient's sex */
    this.Sex = null;
    /** @property {Address}  PatientAddress - The Patient's address */
    this.PatientAddress = null;
    /** @property {string}  PatientEmail - The Patient's email address */
    this.PatientEmail
    /** @property {Contact}  ContactHome - The Patient's home contacts*/
    this.ContactHome = null;
    /** @property {Contact}  ContactBusiness - The Patient's Business contacts*/
    this.ContactBusiness = null;
    /** @property {string}  MaritalStatus - The Patient's Marital Status*/
    this.MaritalStatus = null;
    /** @property {string}  Language - The Patient's Language code*/
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
    //this.Aboriginality = null;


    if (oSeg.Code == "PID")
    {
      // Medical Record number value
      var MRN = new ResolveMrn(oSeg.Element(3), FacilityConfig);
      this.RMHMrnValue = MRN.Value;
      this.RMHMrnAssigningAuthority = MRN.AssigningAuthority;

      //Medicare Number value
      this.MedicareNumberValue = Set(oSeg.Field(19));
      
      //Patient Name
      for (var i=0;  i <= ((oSeg.Field(5).RepeatCount) - 1)  ; i++)
      {
        var oXPN = oSeg.Field(5).Repeats(i);
        if (oXPN.Component(7).AsString.toUpperCase() == "L")
        {
          this.Given = Set(oXPN.Component(2));
          this.Family = Set(oXPN.Component(1));
        }
        else if (FacilityConfig.SiteContext == SiteContextEnum.SAH)
        {
          //SAH does not use NameType codes
          this.Given = Set(oXPN.Component(2));
          this.Family = Set(oXPN.Component(1));
        }
      }

      //Patient Date of Birth
      //require: dd/mm/yyyy
      if (oSeg.Field(7).defined && oSeg.Field(7).AsString != "" && oSeg.Field(7).AsString.length >= 8)
      {
        try
        {
          this.Dob = DateAndTimeFromHL7(oSeg.Field(7).AsString);
        }
        catch(Exec)
        {
          throw "Date of Birth in PID-7 can not be parsed as a Date or Date time, vaule was: " + oSeg.Field(7).AsString;
        }
      }
      else
      {
        this.Dob = null;
      }
      //Patient Sex
      this.Sex = Set(oSeg.Field(8));
      //Patient Marital Status
      this.MaritalStatus = Set(oSeg.Field(16));

      //Patient Language
      if (oSeg.Field(15).AsString != "")
      {
        this.Language = Set(oSeg.Field(15));
      }

      BreakPoint;

      //The Patient ATSI code value
      //if (oSeg.Field(10).ComponentCount > 1 && Component(1).AsString != "")
      //{
      //  this.Aboriginality = Set(oSeg.Field(10).Component(1));
      //}
      
      //Patient Address
      //(1: Business, 2: Mailing Address, 3:Temporary Address, 4:ResidentialHome, 9: Not Specified)
      //ToDo: What to do is we don't first get 4:Residential/Home, do we look for others or send empty fields?

      //Collect the following addresses in this order.
      var AddressTypeArray = [];
      if (FacilityConfig.SiteContext == SiteContextEnum.RMH)
      {
        AddressTypeArray =
        [
          RMHAddressTypeEnum.ResidentialHome,
          RMHAddressTypeEnum.Business,
          RMHAddressTypeEnum.MailingAddress,
          RMHAddressTypeEnum.TemporaryAddress,
          RMHAddressTypeEnum.NotSpecified
        ];
      }
      else
      {
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
      var Dic = ResolveAddressTypeFromXADList(oSeg.Field(11), AddressTypeArray);
      for (var AddressType in AddressTypeArray)
      {
        if (Dic.Exists(AddressTypeArray[AddressType]))
        {
          oXADAdressTarget = Dic.Item(AddressTypeArray[AddressType]);
          break;
        }
      }
      this.PatientAddress = new Address(oXADAdressTarget);
      
      //Email Address For SAH
      if (FacilityConfig.SiteContext == SiteContextEnum.SAH)
      {
        if (Dic.Exists(SAHAddressTypeEnum.Email))
        {
           var oXADEmailAdressTarget = Dic.Item(SAHAddressTypeEnum.Email);
           this.PatientEmail = Set(oXADEmailAdressTarget.Component(1));
        }
        else
        {
          this.PatientEmail = "";
        }
      }
      
      
BreakPoint;
      this.ContactHome = new Contact();
      this.ContactBusiness = new Contact();
      if (FacilityConfig.SiteContext == SiteContextEnum.SAH)
      {
        this.ContactHome.InflateBasic(oSeg.Field(13));
        this.ContactBusiness.InflateBasic(oSeg.Field(14));
      }
      else if (FacilityConfig.SiteContext == SiteContextEnum.RMH)
      {
        this.ContactHome.Inflate(oSeg.Field(13), PhoneUseEnum.Primary);
        this.ContactBusiness.Inflate(oSeg.Field(14), PhoneUseEnum.Work);
      }
      
    }
  }
  

   /**
   * @class
   * @classdesc Internal Meta class Collects Meta-data required for the REST service call
   * @constructor
   * @param {string} Action The ICIMS action string (addpatient, updatepatient, mergepatient)
   * @param {Segment} oMSH The HL7 V2 MSH Message Header Segment for the Message details
   * @inner
  */
  function Meta(oMSH)
  {
    
    this.MessageControlID = null;
    this.MessageDateTime = null;
    this.SendingApplication = null;
    
    if (oMSH.Code !== "MSH")
    {
      throw "Meta Hl7 Segment oMSH must have the segment code 'MSH'.";
    }
    this.MessageControlID = Set(oMSH.Field(10));

    try
    {
      this.MessageDateTime = DateAndTimeFromHL7(oMSH.Field(7).AsString);
    }
    catch(Exec)
    {
      throw "Message Date & Time in MSH-7 can not be parsed as a Date or Date time, vaule was: " + oMSH.Field(7).AsString;
    }
    
    this.SendingApplication = Set(oMSH.Field(3));
  }


 /**
   * @class
   * @classdesc Internal Address class collects data required for addresses
   * @constructor
   * @param {Element} oXAD The HL7 V2 Extended Address element 
   * @inner
  */
  function Address(oXAD)
  {
    /** @property {string} AddressLine1 - Address line one */
    this.AddressLine1 = null;
    /** @property {string} AddressLine2 - Address line two */
    this.AddressLine2 = null;
    /** @property {string} Suburb - Address's suburb */
    this.Suburb = null;
    /** @property {string} State - Address's state */
    this.State = null;
    /** @property {string} Postcode - Address's postcode */
    this.Postcode = null;

    if (oXAD !== null)
    {
      this.AddressLine1 = Set(oXAD.Component(1));
      this.AddressLine2 = Set(oXAD.Component(2));
      this.Suburb = Set(oXAD.Component(3));
      this.State = Set(oXAD.Component(4));
      this.Postcode = Set(oXAD.Component(5));
    }
  }

 /**
   * @class
   * @classdesc Internal Contact class collects data required for contacts (Phone, Mobile, Email, Fax)
   * @constructor
   * @inner
  */
  function Contact()
  {
    /** @property {array} Phone - Phone number list */
    this.Phone = [];
    /** @property {array} Mobile - Mobile number list */
    this.Mobile = [];
    /** @property {array} Email - Email address list */
    this.Email = [];
    /** @property {array} Fax - Fax number list */
    this.Fax = [];

    this.InflateBasic = function(Element)
    {
      if (Element.Component(1).AsString != "")
      {
        if (Element.Component(1).AsString.substring(0, 2) == "04")
        {
          this.Mobile.push(Set(Element.Component(1)));
        }
        else
        {
          this.Phone.push(Set(Element.Component(1)));
        }
      }
    }
    
    this.Inflate = function(Element, UseType)
    {
      for (var i=0;  i <= ((Element.RepeatCount) - 1)  ; i++)
      {
        //Primary Phone
        var oXTN = Element.Repeats(i);
        if (oXTN.Component(2).AsString.toUpperCase() == UseType &&
            oXTN.Component(3).AsString.toUpperCase() == PhoneEquipmentTypeEnum.Telephone)
        {
          this.Phone.push(Set(oXTN.Component(1)));
        }
        //Primary Mobile
        if (oXTN.Component(2).AsString.toUpperCase() == UseType &&
            oXTN.Component(3).AsString.toUpperCase() == PhoneEquipmentTypeEnum.Mobile)
        {
          this.Mobile.push(Set(oXTN.Component(1)));
        }
        //Primary Fax
        if (oXTN.Component(2).AsString.toUpperCase() == UseType &&
            oXTN.Component(3).AsString.toUpperCase() == PhoneEquipmentTypeEnum.FacsimileMachine)
        {
          this.Fax.push(Set(oXTN.Component(1)));
        }
        //Primary Email (Correct Version) e.g ^NET^INTERNET^info@westgatemedical.com.au
        if (oXTN.Component(2).AsString.toUpperCase() == PhoneUseEnum.EmailAddress &&
            oXTN.Component(3).AsString.toUpperCase() == PhoneEquipmentTypeEnum.Internet)
        {
          this.Email.push(Set(oXTN.Component(4)));
        }
        //Primary Email (Incorrect Version on Patients at RMH) e.g angus.millar@iinet.net.au^PRN^NET
        if (oXTN.Component(2).AsString.toUpperCase() == UseType &&
            oXTN.Component(3).AsString.toUpperCase() == PhoneUseEnum.EmailAddress)
        {
          this.Email.push(Set(oXTN.Component(1)));
        }
      }
    }
  }

 
//------------------------------------------------------------------------------
// Private Methods, tools, enums
//------------------------------------------------------------------------------

  /**
   * Enum of all knowen AddressTypes at RMH
   * @readonly
   * @enum {integer}
  */
   var RMHAddressTypeEnum = {
     /** 1 */
     Business : 1,
     /** 2 */
     MailingAddress : 2,
     /** 3 */
     TemporaryAddress : 3,
     /** 4 */
     ResidentialHome : 4,
     /** 9 */
     NotSpecified : 9
   };
   
   /**
   * Enum of all knowen HL7 Table 0190 AddressTypes
   * @readonly
   * @enum {integer}
  */
   var SAHAddressTypeEnum =  {
     /** B */
     Business : "B",
     /** C */
     CurrentoOrTemporary : "C",
     /** F */
     CountyOfOrigin : "F",
     /** H */
     Home : "H",
     /** M */
     Mailing : "M",
     /** O */
     Office : "O",
     /** P */
     Permanent : "P",
     /** E */
     Email : "E"
   };
   
  /**
   * Enum of all knowen PhoneUse at RMH, Component 2
   * @readonly
   * @enum {string}
  */
   var PhoneUseEnum =    {
     /** ASN */
     AnsweringService : "ASN",
     /** BPN */
     Beeper : "BPN",
     /** NET */
     EmailAddress : "NET",
     /** EMR */
     Emergency : "EMR",
     /** ORN */
     Other : "ORN",
     /** PRN */
     Primary : "PRN",
     /** TTY */
     Teletype : "TTY",
     /** VHN */
     Vacation : "VHN",
     /** WPN */
     Work : "WPN"
   };

   /**
     * Enum of all knowen PhoneUse at RMH, Component 3
     * @readonly
     * @enum {string}
    */
   var PhoneEquipmentTypeEnum = {
     /** FX */
     FacsimileMachine : "FX",
     /** INTERNET */
     Internet : "INTERNET",
     /** CP */
     Mobile : "CP",
     /** MD */
     Modem : "MD",
     /** BP */
     Pager : "BP",
     /** PH */
     Telephone : "PH",
     /** TTY */
     Teletype : "TTY"
   };

 /**
   * @class
   * @classdesc Looks for the MRN with the given AssigningAuthorityCode and no end date
   * if none is found yet a 'MR' is found with no AssigningAuthority with no end date
   * then this MRN is assumed to be for the AssigningAuthority we are looking for.
   * @inner
   * @constructor
  */
  function ResolveMrn(oElement, FacilityConfig)
  {
    /** @property {string} Value - The Medical Record Number value */
    this.Value = null;
    /** @property {string} AssigningAuthority - The Medical Record Number's Assigning Authority code */
    this.AssigningAuthority = null;
    
    var FirstMRValue = "";
    var FirstMRAssigningAuthority = "";
    for (var i=0;  i <= ((oElement.RepeatCount) - 1)  ; i++)
    {
      var oCX = oElement.Repeats(i);
      //SAH messages have no AssigningAuthority only a number
      if (FacilityConfig.SiteContext == SiteContextEnum.SAH)
      {
         this.Value = Set(oCX.Component(1));
         this.AssigningAuthority = FacilityConfig.PrimaryMRNAssigningAuthority;
      }
      else if (oCX.Component(5).AsString.toUpperCase() == "MR" &&
          oCX.Component(4).AsString.toUpperCase() == FacilityConfig.PrimaryMRNAssigningAuthority &&
          oCX.Component(8).AsString == "")
      {
         this.Value = Set(oCX.Component(1));
         this.AssigningAuthority = Set(oCX.Component(4));
      }
      else if (oCX.Component(5).AsString.toUpperCase() == "MR" &&
               oCX.Component(8).AsString == "" &&
               FirstMRValue == "")
      {
        FirstMRValue = Set(oCX.Component(1));
        FirstMRAssigningAuthority = Set(oCX.Component(4));
      }
    }
    if (FirstMRValue !== "" && FirstMRAssigningAuthority == null)
    {
      //We found no MRN Value for the given Assigning Auth of RMH so
      //take the first Value of MR type as long as it had no Assigning Auth
      // and asume it ids RMH
      this.Value = FirstMRValue;
      this.AssigningAuthority = AssigningAuthorityCode;
    }
  }



  /** @function
   * @description Get the first XAD element from the Adress List that matches the AddressTypeArray given.
   * returns a Dictonary of all the first instances found for each
   * (1: Business, 2: Mailing Address, 3:Temporary Address, 4:Residential/Home, 9: Not Specified)
   * @param {field} oField HL7 V2 XAD address Element
   * @param {array} AddressTypeEnum Array
   * @returns {Dictionary}
  */
  function ResolveAddressTypeFromXADList(oField, AddressTypeArray)
  {
    var Dic = new ActiveXObject("Scripting.Dictionary");
    for (var AddressType in AddressTypeArray)
    {
      for (var i=0;  i <= ((oField.RepeatCount) - 1)  ; i++)
      {
        var oXAD = oField.Repeats(i);
        if (oXAD.Component(7).AsString.toUpperCase() == AddressTypeArray[AddressType])
        {
          Dic.Add(AddressTypeArray[AddressType], oXAD);
          break;
        }
      }
    }
    return Dic;
  }

  /** @function
   * @description We want the HL7 Nulls |""| within the Business module because we later apply logic to them for ICIMS
   * @param {content} HL7 V2 content (HL7 Connects content construct
   * @returns {string}
  */
  function Set(Content)
  {
    if (Content.IsNull)
      return "\"\"";
    else if (Content.AsString != "")
      return Content.AsString;
    else
      return null;
  }

}