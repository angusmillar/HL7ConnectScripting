function Address(oXAD) {

  this.AddressLine1 = null;
  this.AddressLine2 = null;
  this.Suburb = null;
  this.State = null;
  this.Postcode = null;
  this.AddressType = null;

  var oHl7Support = new HL7V2Support();
  if (oXAD !== null) {
    this.AddressLine1 = oHl7Support.Set(oXAD.Component(1));
    this.AddressLine2 = oHl7Support.Set(oXAD.Component(2));
    this.Suburb = oHl7Support.Set(oXAD.Component(3));
    this.State = oHl7Support.Set(oXAD.Component(4));
    this.Postcode = oHl7Support.Set(oXAD.Component(5));
    this.AddressType = oHl7Support.Set(oXAD.Component(7))
  }
}
