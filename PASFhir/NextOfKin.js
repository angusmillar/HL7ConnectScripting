function NextOfKin(oNK1) {

  this.Family = null;
  this.Given = null;
  this.Title = null;
  this.Sex = null;
  this.Relationship = null;
  this.Address = null;
  this.HomePhoneNumber = null;
  this.WorkPhoneNumber = null;
  this.StartDate = null;
  this.EndDate = null;

  var oHl7Support = new HL7V2Support();

  if (oNK1 !== null) {
    if (oNK1.Field(2).defined) {
      this.Family = oHl7Support.Set(oNK1.Field(2).Component(1));
      this.Given = oHl7Support.Set(oNK1.Field(2).Component(2));
      this.Title = oHl7Support.Set(oNK1.Field(2).Component(5));
    }
    if (oNK1.Field(3).defined) {
      this.Relationship = { Identifier: oHl7Support.Set(oNK1.Field(3).Component(1)), Text: oHl7Support.Set(oNK1.Field(3).Component(2)), NameOfCodingSystem: oHl7Support.Set(oNK1.Field(3).Component(3)) };
    }
    if (oNK1.Field(4).defined) {
      this.Address = new Address(oNK1.Field(4));
    }

    if (oNK1.Field(15).defined) {
      this.Sex = oHl7Support.Set(oNK1.Field(15));
    }

    if (oNK1.Field(5).defined) {
      this.HomePhoneNumber = oHl7Support.Set(oNK1.Field(5).Component(1));
    }

    if (oNK1.Field(6).defined) {
      this.WorkPhoneNumber = oHl7Support.Set(oNK1.Field(6).Component(1));
    }

    if (oNK1.Field(8).AsString != "") {
      try {
        this.StartDate = DateAndTimeFromHL7(oNK1.Field(8).AsString);
      }
      catch (Exec) {
        throw "Start Date & Time in NK1-8 can not be parsed as a Date time, vaule was: " + oNK1.Field(8).AsString;
      }
    }

    if (oNK1.Field(9).AsString != "") {
      try {
        this.StartDate = DateAndTimeFromHL7(oNK1.Field(9).AsString);
      }
      catch (Exec) {
        throw "Start Date & Time in NK1-9 can not be parsed as a Date time, vaule was: " + oNK1.Field(9).AsString;
      }
    }


  }
}
