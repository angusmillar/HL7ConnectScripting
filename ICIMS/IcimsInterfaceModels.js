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

      var AddRecord = new IcimsAddUpdateInterface();
      var InterfaceModel = MapToModel(AddRecord, BusinessModel);
      return EncodeFormData(InterfaceModel);
    }
    else if (BusinessModel.Meta.Action == IcimsPostAction.Update)
    {
      if (!BusinessModel.Patient)
        throw "Patient can not be null for MapToIcimsInterface.";
      //if (!BusinessModel.Doctor)
      //  throw "Doctor can not be null for MapToIcimsInterface.";

      var UpdateRecord = new IcimsAddUpdateInterface();
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
    //address line 1 (string)
    //Model.addr_line_1 = "";
    //address line 2 (string)
    //Model.addr_line_2 = "";
    //suburb name (string)
    //Model.suburb = "";
    //state (string)
    //Model.state = "";
    //post code (string)
    //Model.postcode = "";
    if (BusinessModel.Patient.PatientAddress)
    {
      Model.addr_line_1 = BusinessModel.Patient.PatientAddress.AddressLine1;
      Model.addr_line_2 = BusinessModel.Patient.PatientAddress.AddressLine2;
      Model.suburb = BusinessModel.Patient.PatientAddress.Suburb;
      Model.state = BusinessModel.Patient.PatientAddress.State;
      Model.postcode = BusinessModel.Patient.PatientAddress.Postcode;
    }
    //home phone number (string)
    BreakPoint;
    //Model.phone = "";
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

    //mobile number (string)
    //Model.mobile = "";
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
      //usual GP name (string)
      Model.gp_fname = BusinessModel.Doctor.Given;
      //usual GP name (string)
      Model.gp_surname = BusinessModel.Doctor.Family;
      //usual GP street address line 1 (string)
      //Model.gp_addr_line_1 = null;
      //usual GP street address line 2 (string)
      //Model.gp_addr_line_2 = null;
      //usual GP suburb (string)
      //Model.gp_suburb = null;
      //usual GP state (string)
      //Model.gp_state = null;
      //usual GP post code (string)
      //Model.gp_postcode = null;
      
      if (BusinessModel.Doctor.Address)
      {
        Model.gp_addr_line_1 = BusinessModel.Doctor.Address.AddressLine1;
        Model.gp_addr_line_2 = BusinessModel.Doctor.Address.AddressLine2;
        Model.gp_suburb = BusinessModel.Doctor.Address.Suburb;
        Model.gp_state = BusinessModel.Doctor.Address.State;
        Model.gp_postcode = BusinessModel.Doctor.Address.Postcode;
      }
      //usual GP email (string)
      //Model.gp_email = "";
      //usual GP fax number (string)
      //Model.gp_fax = "";
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
    if (BusinessModel.Meta.Action == IcimsPostAction.Merge)
    {
      //prior MRN (string, mandatory)
      Model.prior_ur = BusinessModel.MergeIdentifers.PriorMRNValue;
      //prior institution ID (string)
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
   * @classdesc The ICIMS Add or Update interface
   * @version 3
   * @inner
   * @constructor
  */
  function IcimsAddUpdateInterface()
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
    this.gp_fname = null;
    /** @property {string} gp_surname - usual GP surname name*/
    this.gp_surname = null;
    /** @property {string} gp_addr_line_1 - GP street address line 1*/
    this.gp_addr_line_1 = null;
    /** @property {string} gp_addr_line_2 - GP street address line 2*/
    this.gp_addr_line_2 = null;
    /** @property {string} gp_suburb - usual GP suburb*/
    this.gp_suburb = null;
    /** @property {string} gp_state - usual GP state*/
    this.gp_state = null;
    /** @property {string} gp_postcode - usual GP post code*/
    this.gp_postcode = null;
    /** @property {string} gp_email - usual GP email*/
    this.gp_email = null;
    /** @property {string} gp_fax - usual GP fax number*/
    this.gp_fax = null;
  }

   /**
   * @class
   * @classdesc  The ICIMS Merge interface
   * @version 3
   * @inner
   * @constructor
  */
  function IcimsMergeInterface()
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
    /** @property {string} prior_ur - prior patient UR number (mandatory) */
    this.prior_ur = null;
    /** @property {string} assigning_authority - prior institution id */
    this.prior_assigning_authority = null;
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