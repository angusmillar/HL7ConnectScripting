/**
 * @module
 * @description The IcimsInterfaceModels script contains the interface classes which are one-to-one matches to the ICIMS API objects.
 * It also contains the methods that map the BusinessModels into the ICIMS interface object
*/

/**
 * @class
 * @requires module:BusinessModels.js
 * @constructor
 * @param {enum} SiteContext Icims Interface Models
 */
function IcimsInterfaceModels()
{
  /**
   * @function
   * @description On passing in a BusinessModel it will map the apropirate properties to the apropirate ICIMS interface model
   * @param {BusinessModel} BusinessModel The BusinessModel object
   * @returns {string} URLEncoded payload to be sent to ICIMS
  */
  this.MapToIcimsInterface = function(BusinessModel)
  {
  BreakPoint;
    if (!BusinessModel.Meta)
      throw "Meta can not be null for MapToIcimsInterface.";
      
    if (BusinessModel.Meta.Action == IcimsPostAction.Add)
    {
      if (!BusinessModel.Patient)
        throw "Patient can not be null for MapToIcimsInterface.";
      //if (!BusinessModel.Doctor)
      //  throw "Doctor can not be null for MapToIcimsInterface.";

      var AddRecord = new IcimsAddInterface();
      var InterfaceModel = MapToModel(AddRecord, BusinessModel);
      return EncodeFormData(InterfaceModel);
    }
    else if (BusinessModel.Meta.Action == IcimsPostAction.Update)
    {
      if (!BusinessModel.Patient)
        throw "Patient can not be null for MapToIcimsInterface.";
      //if (!BusinessModel.Doctor)
      //  throw "Doctor can not be null for MapToIcimsInterface.";

      var UpdateRecord = new IcimsUpdateInterface();
      var InterfaceModel = MapToModel(UpdateRecord, BusinessModel);
      return EncodeFormData(InterfaceModel);
    }
    else if (BusinessModel.Meta.Action == IcimsPostAction.Merge)
    {
      if (!BusinessModel.Patient)
        throw "Patient can not be null for MapToIcimsInterface.";
      if (!BusinessModel.MergeIdentifers)
        throw "MergeIdentifers can not be null for MapToIcimsInterface.";

      var MergeRecord = new IcimsMergeInterface();
      var InterfaceModel = MapToModel(MergeRecord, BusinessModel);
      return EncodeFormData(InterfaceModel);
    }
    else
    {
      Kernel.WriteToLog(DBG_Serious, "ICIMS Scripting error, Model Context unkowen "+ Context);
      Kernel.WriteToLog(DBG_Serious, "ICIMS Script is stopping interface due to scripting error.");
      Kernel.GetInterface("SendToICIMSScripted").Stop(false, "Script-Error", "Model Context unkowen "+ Context);
      aEvent.IncomingHandled = false;
    }
    return new IcimsAddUpdateInterface();
  };

  /**
   * @function
   * @description  Internal function to perform the mapping from the internal Business Model to ICIMS Interface model
   * @param {InterfaceModel} Model The ICIMS Interface model
   * @param {BusinessModel} BusinessModel The internal Business Model
   * @inner
  */
  function MapToModel(Model, BusinessModel)
  {
Breakpoint;
    //"addpatient"
    Model.action = BusinessModel.Meta.Action;
    //HL7 Message ID (MSH-10)
    Model.msgid = BusinessModel.Meta.MessageControlID;
    //datetime string sent by the HL7 caller
    Model.msg_datetime = BusinessModel.Meta.MessageDateTime.AsXML;
    //patient UR number (string)
    Model.ur_num = BusinessModel.Patient.RMHMrnValue;
    //institution id (string)
    Model.assigning_authority = BusinessModel.Patient.RMHMrnAssigningAuthority;
    //patient first name (string)
    Model.fname = BusinessModel.Patient.Given;
    //patient surname (string)
    Model.surname = BusinessModel.Patient.Family;
    //patient DOB (string - ISO8601)
    if (BusinessModel.Patient.Dob !== null)
    {
      Model.dob = BusinessModel.Patient.Dob.AsXML;
    }
    //patient sex (string)
    Model.sex = BusinessModel.Patient.Sex;
    
    //Patient Address
    if (BusinessModel.Patient.PatientAddress)
    {
      Model.addr_line_1 = BusinessModel.Patient.PatientAddress.AddressLine1;
      Model.addr_line_2 = BusinessModel.Patient.PatientAddress.AddressLine2;
      Model.suburb = BusinessModel.Patient.PatientAddress.Suburb;
      Model.state = BusinessModel.Patient.PatientAddress.State;
      Model.postcode = BusinessModel.Patient.PatientAddress.Postcode;
    }
    
    BreakPoint;
    //Patient Contacts Home
    if (BusinessModel.Patient.ContactHome)
    {
     if (BusinessModel.Patient.ContactHome.Phone.length > 0)
     {
       Model.phone = BusinessModel.Patient.ContactHome.Phone[0];
     }
    }
    if (Model.phone == null && BusinessModel.Patient.ContactBusiness)
    {
     if (BusinessModel.Patient.ContactBusiness.Phone.length > 0)
     {
       Model.phone = BusinessModel.Patient.ContactBusiness.Phone[0];
     }
    }

    //Patient Contacts mobile
    if (BusinessModel.Patient.ContactHome)
    {
     if (BusinessModel.Patient.ContactHome.Mobile.length > 0)
     {
       Model.mobile = BusinessModel.Patient.ContactHome.Mobile[0];
     }
    }
    if (Model.mobile == null && BusinessModel.Patient.ContactBusiness)
    {
     if (BusinessModel.Patient.ContactBusiness.Mobile.length > 0)
     {
       Model.mobile = BusinessModel.Patient.ContactBusiness.Mobile[0];
     }
    }
    //marital status (string)
    Model.marital_status = BusinessModel.Patient.MaritalStatus;
    //language (string)
    Model.language = BusinessModel.Patient.Language;
    //aboriginality (string)
    Model.aboriginality = BusinessModel.Patient.Aboriginality;
    
    if ((BusinessModel.Meta.Action == IcimsPostAction.Add || BusinessModel.Meta.Action == IcimsPostAction.Update)
    && (BusinessModel.Doctor != null))
    {
      Model.gp_fname = BusinessModel.Doctor.Given;
      Model.gp_surname = BusinessModel.Doctor.Family;
      
      //Doctor Address
      if (BusinessModel.Doctor.Address)
      {
        Model.gp_addr_line_1 = BusinessModel.Doctor.Address.AddressLine1;
        Model.gp_addr_line_2 = BusinessModel.Doctor.Address.AddressLine2;
        Model.gp_suburb = BusinessModel.Doctor.Address.Suburb;
        Model.gp_state = BusinessModel.Doctor.Address.State;
        Model.gp_postcode = BusinessModel.Doctor.Address.Postcode;
      }
      
      //Doctor Contacts
      if (BusinessModel.Doctor.Contact)
      {
        if (BusinessModel.Doctor.Contact.Email.length > 0)
        {
          Model.gp_email = BusinessModel.Doctor.Contact.Email[0];
        }
        if (BusinessModel.Doctor.Contact.Fax.length > 0)
        {
          Model.gp_fax = BusinessModel.Doctor.Contact.Fax[0];
        }
      }
    }
    //Merge info
    if (BusinessModel.Meta.Action == IcimsPostAction.Merge)
    {
      Model.prior_ur = BusinessModel.MergeIdentifers.PriorMRNValue;
      Model.prior_assigning_authority = BusinessModel.MergeIdentifers.PriorMRNAssigningAuthority;
    }
    return Model;
  }

   /**
   * @function
   * @description URL Encode the objects to be sent over HTTP
   * @inner
  */
  function EncodeFormData(Obj)
  {
    var formBody = [];
    for(var name in Obj)
    {
      var PropertyName = name;
      var PropertyValue = Obj[name];
      //BreakPoint;
      if (PropertyValue == "\"\"")
      {
        //Note ICIMS is requiring that HL7 Null e.g |""| is to be sent as "empty_str";
        PropertyValue = "empty_str";
      }
      if (PropertyValue != null)
      {
        var encodedKey = encodeURIComponent(PropertyName);
        var encodedValue = encodeURIComponent(PropertyValue);
        formBody.push(encodedKey + "=" + encodedValue);
      }
    }
    formBody = formBody.join("&");
    return formBody;
  }


   /**
   * @class
   * @classdesc  The ICIMS IcimsAddInterface inherit's from IcimsAddUpdateInterfaceBase
   * @version 3
   * @inner
   * @constructor
  */
  function IcimsAddInterface()
  {
    //Inherit's from IcimsAddUpdateInterfaceBase and scope as Add
    var Add = new IcimsAddUpdateInterfaceBase();
    return Add;
  }

   /**
   * @class
   * @classdesc  The ICIMS IcimsUpdateInterface inherit's from IcimsAddUpdateInterfaceBase
   * @version 3
   * @inner
   * @constructor
  */
  function IcimsUpdateInterface()
  {
    //Inherit's from IcimsAddUpdateInterfaceBase and scope as Update
    var Update = new IcimsAddUpdateInterfaceBase();
    return Update;
  }

   /**
   * @class
   * @classdesc  The ICIMS IcimsMergeInterface inherit's from IcimsAddUpdateInterfaceBase
   * @version 3
   * @inner
   * @constructor
  */
  function IcimsMergeInterface()
  {
    //Inherit's from IcimsAddUpdateInterfaceBase and scope and add properties for Merge
    var Merge = new IcimsInterfaceBase();

    /** @property {string} prior_ur - prior patient UR number (mandatory) */
    Merge.prior_ur = null;
    /** @property {string} assigning_authority - prior institution id */
    Merge.prior_assigning_authority = null;
   
    return Merge;
  }

 /**
   * @class
   * @classdesc  The ICIMS IcimsAddUpdateInterfaceBase inherit's from IcimsInterfaceBase
   * @version 3
   * @inner
   * @constructor
  */
  function IcimsAddUpdateInterfaceBase()
  {
    //Inherit's from IcimsInterfaceBase and add properties for Add and Update
    var Base = new IcimsInterfaceBase();
    
    Base.gp_fname = null;
    /** @property {string} gp_surname - usual GP surname name*/
    Base.gp_surname = null;
    /** @property {string} gp_addr_line_1 - GP street address line 1*/
    Base.gp_addr_line_1 = null;
    /** @property {string} gp_addr_line_2 - GP street address line 2*/
    Base.gp_addr_line_2 = null;
    /** @property {string} gp_suburb - usual GP suburb*/
    Base.gp_suburb = null;
    /** @property {string} gp_state - usual GP state*/
    Base.gp_state = null;
    /** @property {string} gp_postcode - usual GP post code*/
    Base.gp_postcode = null;
    /** @property {string} gp_email - usual GP email*/
    Base.gp_email = null;
    /** @property {string} gp_fax - usual GP fax number*/
    Base.gp_fax = null;
    
    return Base;
  }

  /**
   * @class
   * @classdesc The IcimsInterfaceBase model
   * @version 3
   * @inner
   * @constructor
  */
  function IcimsInterfaceBase()
  {
    /** @property {string} action - the ICIMS action string 'addpatient', 'updatepatient' */
    this.action = null;
    /** @property {string} msgid - unique message id sent by the HL7 caller */
    this.msgid = null;
    /** @property {string} msg_datetime - datetime string sent by the HL7 caller ISO8601 format */
    this.msg_datetime = null;
    /** @property {string} ur_num - patient UR number */
    this.ur_num = null;
    /** @property {string} assigning_authority - institution id */
    this.assigning_authority = null;
    /** @property {string} fname - patient first name */
    this.fname = null;
    /** @property {string} surname - patient surname */
    this.surname = null;
    /** @property {string} dob - patient DOB ISO8601 format */
    this.dob = null;
    /** @property {string} sex - patient sex */
    this.sex = null;
    /** @property {string} addr_line_1 - Patient's address line 1 */
    this.addr_line_1 = null;
    /** @property {string} addr_line_2 - Patient's address line 2 */
    this.addr_line_2 = null;
    /** @property {string} suburb - Patient's suburb name */
    this.suburb = null;
    /** @property {string} state - Patient's state */
    this.state = null;
    /** @property {string} postcode - Patient's postcode */
    this.postcode = null;
    /** @property {string} phone - Patient home phone number */
    this.phone = null;
    /** @property {string} mobile - Patient mobile number */
    this.mobile = null;
    /** @property {string} marital_status - Patient marital status */
    this.marital_status = null;
    /** @property {string} language - Patient's language code*/
    this.language = null;
    /** @property {string} aboriginality - The Patient's ATSI code value*/
    this.aboriginality = null;
    /** @property {string} gp_fname - usual GP first name*/
  }
  
}

/** @global*/
/**
 * Enum for ICIMS POST actions.
 * @readonly
 * @enum {string}
 * @global
*/
var IcimsPostAction = {
  /** addpatient */
  Add : "addpatient",
  /** updatepatient */
  Update : "updatepatient",
  /** mergepatient */
  Merge : "mergepatient"
};