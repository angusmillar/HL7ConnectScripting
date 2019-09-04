function Address(oXAD) {

  this.AddressLine1 = null;
  this.AddressLine2 = null;
  this.Suburb = null;
  this.State = null;
  this.Postcode = null;
  this.AddressType = null;
  this.FormattedAddress = null;

  var oHl7Support = new HL7V2Support();
  if (oXAD !== null) {
    this.AddressLine1 = oHl7Support.Set(oXAD.Component(1));
    this.AddressLine2 = oHl7Support.Set(oXAD.Component(2));
    this.Suburb = oHl7Support.Set(oXAD.Component(3));
    this.State = oHl7Support.Set(oXAD.Component(4));
    this.Postcode = oHl7Support.Set(oXAD.Component(5));
    this.AddressType = oHl7Support.Set(oXAD.Component(7))
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
