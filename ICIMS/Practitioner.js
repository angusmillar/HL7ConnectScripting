function Practitioner(oXAD) {

  this.Family = null;
  this.Given = null;
  this.Title = null;
  this.FormattedName = null;
  this.MedicareProviderNumber = null;

  this.InflateXCN = function (oXCN) {
    var V2Support = new HL7V2Support();
    var oStringSupport = new StringSupport();

    if (oXCN != null) {
      this.MedicareProviderNumber = oStringSupport.RemoveWhiteSpace(V2Support.Set(oXCN.Component(1)));
      this.Family = V2Support.Set(oXCN.Component(2));
      this.Given = V2Support.Set(oXCN.Component(3));
      this.Title = V2Support.Set(oXCN.Component(6));
    }

    if (this.Title != null && this.Given != null) {
      this.FormattedName = this.Family.toUpperCase() + ", " + this.Title + " " + this.Given;
    } else if (this.Title == null && this.Given != null) {
      this.FormattedName = this.Family.toUpperCase() + ", " + this.Given;
    } else if (this.Family != null) {
      this.FormattedName = this.Family.toUpperCase();
    } else {
      this.FormattedName = null;
    }
  }
}
