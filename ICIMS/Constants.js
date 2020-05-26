function Constants() {

  //Base Urls
  this.baseUrl = {
    icims: {
      resourceProfile: "https://www.icims.com.au/fhir"
    }
  };

  //Organization info
  this.organization = {
    icims: {
      id: "bab13701-776a-41fd-86a9-7aa19df2825d",
      name: "ICIMS",
      aliasList: ["Innovative Clinical Information Management Systems"]
    },
    sah: {
      id: "95f4641f-6de7-470c-a44c-90ef5eb17faf",
      name: "SAH",
      aliasList: ["SAN", "Sydney Adventist Hospital"],
      application: {
        cliniSearch: {
          code: "CliniSearch",
          name: "CliniSearch"
        },
        sanApps: {
          code: "SANAPPS",
          name: "SAN APPS"
        },
        careZone: {
          code: "CareZone",
          name: "Care Zone"
        },
        epiSoft: {
          code: "EPISOFT",
          name: "Epi SOFT",
          codeSystem: {
            FillerOrderNumber: "70a870ef-2a29-4475-bd1d-1604a7eacbe9"
          }
        }
      }
    },
    dhm: {
      id: "dfc54194-06d4-4fb4-afad-773a8cd4175b",
      name: "DHM",
      aliasList: ["DHM", "Douglass Hanly Moir", "Sonic Pathology"],
      application: {
        apollo: {
          code: "APOLLO",
          name: "Apollo"
        }
      },
      codeSystem: {
        FillerOrderNumber: "http://www.dhm.com.au/fhir/pathology/fillerOrderNumber",
        ReportPanel: "http://www.dhm.com.au/fhir/pathology/reportPanelCode"
      }
    }
  };


  //Fhir Resource Profiles urls
  this.fhirResourceProfile = {
    icims: {
      messageBundle: this.baseUrl.icims.resourceProfile + "/StructureDefinition/icims-message-bundle",
      messageHeader: this.baseUrl.icims.resourceProfile + "/StructureDefinition/icims-messageHeader",
      diagnosticReport: this.baseUrl.icims.resourceProfile + "/StructureDefinition/icims-diagnosticReport",
      patient: this.baseUrl.icims.resourceProfile + "/StructureDefinition/icims-patient",
      observation: this.baseUrl.icims.resourceProfile + "/StructureDefinition/icims-observation",
      organization: this.baseUrl.icims.resourceProfile + "/StructureDefinition/icims-organization",
      provenance: this.baseUrl.icims.resourceProfile + "/StructureDefinition/icims-provenance",
      procedureRequest: this.baseUrl.icims.resourceProfile + "/StructureDefinition/icims-procedureRequest"
    }
  };



}