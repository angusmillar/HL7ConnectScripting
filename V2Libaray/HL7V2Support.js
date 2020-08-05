function HL7V2Support() {

  //Used to set model properties to ensure HL7 Null is sent as "" and empty is set as null.
  this.Set = function (Content) {
    return Set(Content);
  }

  this.GetCEByField = function (CEField) {
    return GetCEByField(CEField);
  }

  // Looks for the MRN with the given AssigningAuthorityCode and no end date
  // if none is found yet a 'MR' is found with no AssigningAuthority with no end date
  // then this MRN is assumed to be for the AssigningAuthority we are looking for.
  this.ResolveMrn = function (oElement, oFacilityConfig) {
    //The Medical Record Number value 
    this.Value = null;
    //The Medical Record Number's Assigning Authority code 
    this.AssigningAuthority = null;
    for (var i = 0; i <= ((oElement.RepeatCount) - 1); i++) {
      var oCX = oElement.Repeats(i);
      //SAH messages have no AssigningAuthority only a number
      if (oFacilityConfig.SiteContext == oFacilityConfig.SiteContextEnum.TST) {
        if (oCX.Component(5).AsString.toUpperCase() == "MR") {
          this.Value = Set(oCX.Component(1));
          this.AssigningAuthority = oFacilityConfig.PrimaryMRNAssigningAuthority;
          break;
        }
      }
    }
    //Check we found an identifier and report why not
    if (this.Value == null) {
      var MessageBegining = "Unable to locate the primary patient identifier. ";;
      switch (oFacilityConfig.SiteContext) {
        case oFacilityConfig.SiteContextEnum.TST:
          throw new Error(MessageBegining + "There must be an identifier of Type 'MR', if many are found the first one will be used.");
        default:
          throw new Error(MessageBegining + "No logic to find a primary patient identifier in has implemented for the site code: " + oFacilityConfig.SiteContext);
      }
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

  function GetCEByField(Field) {
    var oCE = { Identifier: "", Text: "", NameOfCodingSystem: "" };
    if (Field.defined) {
      oCE.Identifier = Set(Field.Component(1));
    }
    if (Field.Component(2).defined) {
      oCE.Text = Set(Field.Component(2));
    }
    if (Field.Component(3).defined) {
      oCE.NameOfCodingSystem = Set(Field.Component(3));
    }
    if (Field.Component(4).defined) {
      oCE.AltIdentifier = Set(Field.Component(4));
    }
    if (Field.Component(5).defined) {
      oCE.AltText = Set(Field.Component(5));
    }
    if (Field.Component(6).defined) {
      oCE.AltNameOfCodingSystem = Set(Field.Component(6));
    }
    return oCE;
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