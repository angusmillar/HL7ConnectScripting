function AllergyIntolerance(oAL1) {

  this.TypeCode = null;
  this.Code = null;
  this.SeverityCode = null;
  this.ReactionCode = null;
  this.IdentificationDate = null;

  var oHl7Support = new HL7V2Support();
  if (oAL1 !== null) {

    if (oAL1.Field(2).defined) {
      this.TypeCode = oHl7Support.GetCEByField(oAL1.Field(2))
    }

    if (oAL1.Field(3).defined) {
      this.Code = oHl7Support.GetCEByField(oAL1.Field(3))
    }

    if (oAL1.Field(4).defined) {
      this.SeverityCode = oHl7Support.GetCEByField(oAL1.Field(4))
    }

    if (oAL1.Field(5).defined) {
      this.ReactionCode = oHl7Support.GetCEByField(oAL1.Field(5))
    }

    if (oAL1.Field(6).Defined) {
      try {
        this.IdentificationDate = DateAndTimeFromHL7(oAL1.Field(6).AsString);
      }
      catch (Exec) {
        throw new Error("Identification Date & Time in AL1-6 can not be parsed as a Date time, vaule was: " + oAL1.Field(6).AsString);
      }
    }

  }

}
