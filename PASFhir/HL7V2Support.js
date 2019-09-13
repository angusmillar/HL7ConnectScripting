function HL7V2Support() {

  //Used to set model properties to ensure HL7 Null is sent as "" and empty is set as null.
  this.Set = function (Content) {
    return Set(Content);
  }

  // Looks for the MRN with the given AssigningAuthorityCode and no end date
  // if none is found yet a 'MR' is found with no AssigningAuthority with no end date
  // then this MRN is assumed to be for the AssigningAuthority we are looking for.
  this.ResolveMrn = function (oElement, oFacilityConfig) {
    //The Medical Record Number value 
    this.Value = null;
    //The Medical Record Number's Assigning Authority code 
    this.AssigningAuthority = null;

    var FirstMRValue = "";
    var FirstMRAssigningAuthority = "";
    for (var i = 0; i <= ((oElement.RepeatCount) - 1); i++) {
      var oCX = oElement.Repeats(i);
      //SAH messages have no AssigningAuthority only a number
      if (oFacilityConfig.SiteContext == oFacilityConfig.SiteContextEnum.SAH) {
        this.Value = Set(oCX.Component(1));
        this.AssigningAuthority = oFacilityConfig.PrimaryMRNAssigningAuthority;
      }
      else if (oCX.Component(5).AsString.toUpperCase() == "MR" &&
        oCX.Component(4).AsString.toUpperCase() == oFacilityConfig.PrimaryMRNAssigningAuthority &&
        oCX.Component(8).AsString == "") {
        this.Value = Set(oCX.Component(1));
        this.AssigningAuthority = Set(oCX.Component(4));
      }
      else if (oCX.Component(5).AsString.toUpperCase() == "MR" &&
        oCX.Component(8).AsString == "" &&
        FirstMRValue == "") {
        FirstMRValue = Set(oCX.Component(1));
        FirstMRAssigningAuthority = Set(oCX.Component(4));
      }
    }
    if (FirstMRValue !== "" && FirstMRAssigningAuthority == null) {
      //We found no MRN Value for the given Assigning Auth of RMH so
      //take the first Value of MR type as long as it had no Assigning Auth
      // and asume it ids RMH
      this.Value = FirstMRValue;
      this.AssigningAuthority = AssigningAuthorityCode;
    }
  }

  // Get the first XAD element from the Adress List that matches the AddressTypeArray given.
  // returns a Dictonary of all the first instances found for each
  // (1: Business, 2: Mailing Address, 3:Temporary Address, 4:Residential/Home, 9: Not Specified)
  this.ResolveAddressTypeFromXADList = function (oField, AddressTypeArray) {
    var Dic = new ActiveXObject("Scripting.Dictionary");
    for (var AddressType in AddressTypeArray) {
      for (var i = 0; i <= ((oField.RepeatCount) - 1); i++) {
        var oXAD = oField.Repeats(i);
        if (oXAD.Component(7).AsString.toUpperCase() == AddressTypeArray[AddressType]) {
          Dic.Add(AddressTypeArray[AddressType], oXAD);
          break;
        }
      }
    }
    return Dic;
  }

  function Set(Content) {
    if (Content.defined) {
      if (Content.IsNull) {
        return "\"\"";
      } else if (Content.AsString != "") {
        return Content.AsString;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  this.AddressTypeTable0190Enum = {

    Business: "B",
    BadAddress: "BA",
    CurrentoOrTemporary: "C",
    CountyOfOrigin: "F",
    Home: "H",
    Mailing: "M",
    Office: "O",
    Permanent: "P",
    Email: "E"
  };

}