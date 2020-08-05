function Merge(oFacilityConfig) {

  this.PriorMrn = null;
  //this.FacilityConfig = oFacilityConfig;

  this.MRGSegmentInflate = function (oMRG) {
    var oHl7Support = new HL7V2Support();
    if (oMRG.Element(1).defined) {
      try {
        this.PriorMrn = new oHl7Support.ResolveMrn(oMRG.Element(1), oFacilityConfig);
      } catch (Exec) {
        throw new Error("Unable to locate the primary prior merge patient identifier from MRG-1. " + Exec.message);
      }
    }
  }


}