function Practitioner() {

  this.Family = null;
  this.Given = null;
  this.Title = null;
  this.MedicareProviderNumber = null;
  this.FormattedName = null;

  this.InflateNDL = function (oNDL) {
    //|2292333W&Saks&Avigdor|
    if (oNDL == null) {
      return null;
    }
    var V2Support = new HL7V2Support();
    var oStringSupport = new StringSupport();

    this.MedicareProviderNumber = oStringSupport.RemoveWhiteSpace(V2Support.Set(oNDL.Component(1).SubComponent(1)));
    this.Family = V2Support.Set(oNDL.Component(1).SubComponent(2));
    this.Given = V2Support.Set(oNDL.Component(1).SubComponent(3));
    this.Title = V2Support.Set(oNDL.Component(1).SubComponent(6));
    this.GetFormattedName();
  }

  this.InflateXCN = function (oXCN) {
    if (oXCN == null) {
      return null;
    }
    var V2Support = new HL7V2Support();
    var oStringSupport = new StringSupport();

    this.MedicareProviderNumber = oStringSupport.RemoveWhiteSpace(V2Support.Set(oXCN.Component(1)));
    this.Family = V2Support.Set(oXCN.Component(2));
    this.Given = V2Support.Set(oXCN.Component(3));
    this.Title = V2Support.Set(oXCN.Component(6));
    this.GetFormattedName();
  }

  this.GetFormattedName = function () {
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
