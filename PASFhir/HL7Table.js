function HL7Table() {

  //v2.4 Table 0201: Telecommunication use code  
  this.PhoneUseEnum = {
    AnsweringService: "ASN",
    Beeper: "BPN",
    EmailAddress: "NET",
    Emergency: "EMR",
    Other: "ORN",
    Primary: "PRN",
    Vacation: "VHN",
    Work: "WPN"
  };

  // v2.4 Table 0202: Telecommunication equipment type   
  this.PhoneEquipmentTypeEnum = {
    FacsimileMachine: "FX",
    Internet: "INTERNET",
    Mobile: "CP",
    Modem: "MD",
    Pager: "BP",
    Telephone: "PH",
    Teletype: "TTY"
  };

  // v2.4 Table 0004: Patient class  
  this.PatientClass = {
    Obstetrics: "B",
    CommercialAccount: "C",
    Emergency: "E",
    Inpatient: "I",
    NotApplicable: "N",
    Outpatient: "O",
    Preadmit: "P",
    RecurringPatient: "R",
    Unknown: "U"
  };
}
