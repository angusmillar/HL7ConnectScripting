function Patient(oSeg, oFacilityConfig) {
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
  this.PatientAddressList = [];
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

  if (oSeg.Code == "PID") {
    var oHl7Support = new HL7V2Support();
    // Medical Record number value
    var MRN = new oHl7Support.ResolveMrn(oSeg.Element(3), oFacilityConfig);
    this.PrimaryMrnValue = MRN.Value;
    this.PrimaryMrnAssigningAuthority = MRN.AssigningAuthority;

    //Medicare Number value
    this.MedicareNumberValue = oHl7Support.Set(oSeg.Field(19));

    //Patient Name
    for (var i = 0; i <= ((oSeg.Field(5).RepeatCount) - 1); i++) {
      var oXPN = oSeg.Field(5).Repeats(i);
      if (oXPN.Component(7).AsString.toUpperCase() == "L") {
        this.Title = oHl7Support.Set(oXPN.Component(5));
        this.Given = oHl7Support.Set(oXPN.Component(2));
        this.Family = oHl7Support.Set(oXPN.Component(1));
      }
      else if (oFacilityConfig.SiteContext == oFacilityConfig.SiteContextEnum.TST) {
        //SAH does not use NameType codes
        this.Title = oHl7Support.Set(oXPN.Component(5));
        this.Given = oHl7Support.Set(oXPN.Component(2));
        this.Family = oHl7Support.Set(oXPN.Component(1));
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
        throw "Date of Birth in PID-7 can not be parsed as a Date or Date time, vaule was: " + oSeg.Field(7).AsString;
      }
    }
    else {
      this.Dob = null;
    }
    //Patient Sex
    this.Sex = oHl7Support.Set(oSeg.Field(8));

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
          throw "The Patient sex found in PID-8 was not expected, value is : " + oOBR.Field(25).AsString + ", allowed values are (F,M,A,N,O,U).";
      }
    }

    //Patient Marital Status
    this.MaritalStatus = oHl7Support.Set(oSeg.Field(16));

    //Patient Language
    if (oSeg.Field(15).AsString != "") {
      this.Language = oHl7Support.Set(oSeg.Field(15));
    }

    //BreakPoint;
    //The Patient ATSI code value
    if (oSeg.Field(10).AsString != "" && oSeg.Field(10).ComponentCount > 1 && oSeg.Field(10).Component(1).AsString != "") {
      this.Aboriginality = oHl7Support.Set(oSeg.Field(10).Component(1));
    }

    //Patient Address
    //(1: Business, 2: Mailing Address, 3:Temporary Address, 4:ResidentialHome, 9: Not Specified)
    //ToDo: What to do is we don't first get 4:Residential/Home, do we look for others or send empty fields?

    //Collect the following addresses in this order.

    for (var i = 0; i <= ((oSeg.Field(11).RepeatCount) - 1); i++) {
      var AddressItem = new Address(oSeg.Field(11).Repeats(i));
      this.PatientAddressList.push(AddressItem);
    }

    this.ContactHome = new Contact();
    this.ContactBusiness = new Contact();
    var oHL7Table = new HL7Table();
    this.ContactHome.Inflate(oSeg.Field(13), oHL7Table.PhoneUseEnum.Primary);
    this.ContactBusiness.Inflate(oSeg.Field(14), oHL7Table.PhoneUseEnum.Work);
  }
}