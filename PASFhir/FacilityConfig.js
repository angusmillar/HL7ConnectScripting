function FacilityConfig() {

  //enum of the sites configured for this script.
  //Add to this list as new sites are brought on board.
  this.SiteContextEnum = {
    /** RMH */
    SAH: "SAH"
  };

  //Config for fhir
  this.FhirConfig = null;

  // The static action name required by ICIMS for AddPatient requests.*/
  this.SiteContext = null;

  // The Assigning Authority code used by the site for its primary Medical Record Number in HL7 V2 Messages */
  this.PrimaryMRNAssigningAuthority = null;

  // The Uri code used by the site for its primary Medical Record Number in FHIR Identifiers*/
  this.PrimaryMRNSystemUri = null;

  // The REST endpoint url for ICIMS.*/
  this.EndPoint = null;

  // The REST endpoint Operation Name for ICIMS.*/
  this.OperationName = null;

  // The REST endpoint url for ICIMS.*/
  this.SendPathologyPdfReport = false;

  // The static Authorization Token to make the REST call against ICIMS service. */
  this.AuthorizationToken = null;

  // The name of the HL7 Connect interface this script is triggered from */
  this.NameOfInterfaceRunnningScript = null;

  // The number of Reject counts before the interface will stop, these are the red errors on the HL7Connect status page
  this.MaxRejectBeforeInterfaceStop = 20;



  this.SetSiteContext = function (SiteContext) {
    if (SiteContext.toUpperCase() == this.SiteContextEnum.RMH) {
      this.SiteContext = SiteContext;
    }
    else if (SiteContext.toUpperCase() == this.SiteContextEnum.SAH) {
      this.SiteContext = SiteContext;
    }
    else {
      var SiteList = [];
      for (var Site in this.SiteContextEnum) {
        SiteList.push(Site);
      }
      var Sites = SiteList.join(" or ");
      if (aEvent.Parameter == "") {
        throw "No SiteContext script parameter passed to the running script. Allowed (" + Sites + ")";
      }
      else {
        throw "Unknowen SiteContext parameter of '" + aEvent.Parameter + "' passed to the running script. Allowed (" + Sites + ")";
      }
    }
  }
}
