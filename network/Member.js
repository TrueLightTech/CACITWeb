/*
 * Placeholder shapes used before an API response arrives.
 *
 * The list defaults below were previously seeded with a single example item
 * (`results: [ChurchMember]`). Those references point at constants declared
 * further down this file, and `const` compiles to `var`, so each one evaluated
 * to `[undefined]` — a phantom row that crashed any `v-for` reading a property
 * off it. An empty list is what these defaults always meant.
 */

export const MemberList = {
  pageIndex: 0,
  pageSize: 10,
  results: [],
  totalCount: 16,
  totalPages: 2
}

export const ChurchMember = {
  id: "",
  churchFamilyId: "",
  churchGroupId: "",
  churchId: "",
  createdAt: "",
  dataOfBirth: "",
  emailAddress: "",
  gender: "Male",
  churchFamilyName: "",
  name: "",
  phoneNumber: "",
  profilePicture: "",
  roleId: null,
  updatedAt: null
}

export const IndividualTithe = {
  userFamilyId: "",
  userFamilyName: "",
  userName: "",
  amountPaid: 0,
  serviceId: "",
  serviceName: "",
  signature: ""
}

export const IndividualTitheList = {
  results: [IndividualTithe]
}

export const Tithe = {
  titheId: null,
  week1: 0,
  week2: 0,
  week3: 0,
  week4: 0,
  week5: 0
}

export const Offering = {
  id: "",
  name: "",
  amount: 0,
  serviceId: "",
  serviceName: "",
  assignFamilyName: "",
  offeringTypeName: "",
  userName: "",
  createdAt: ""
}


export const Announcement = {
  id: "",
  title: "",
  body: "",
  image: "",
  announcementSummaryMessage: "",
  createdAt: ""
}

export const DashboardAccountingTotal = {
  titheSum: 0.0,
  offeringSum: 0.0,
  welfareSum: 0.0,
  total: 0.0
}

export const Issue = {
  id: "",
  userId: "",
  userName: "",
  createdAt: "",
  updatedAt: null,
  title: "",
  issueMessage: "",
  isResolved: false
}

export const TitheAggregate = {
  userFamilyName: "",
  userFamilyId: "",
  totalAmount: 0
}

export const TitheAggregateList = {
  data: [TitheAggregate]
}

export const OfferingList = {
  results: [Offering],
  pageIndex: 0,
  pageSize: 10,
  totalCount: 16,
  totalPages: 2
}

export const OfferingAltList = {
  data: []
}

export const OfferingTypes = {
  offeringTypeId: "",
  offeringTypeName: "",
  data: []
}

export const OffType = {
  assignFamilyId: "",
  assignFamilyName: "",
  serviceId: "",
  serviceName: "",
  amount: 0,
  doW: 0
}

export const IssuesList = {
  results: [Issue]
}

export const GroupList = {
  data: []
}

export const ChurchFamilyList = {
  data: []
}

export const ChurchWelfareList = {
  results: []
}

export const OfferingType = {
  data: []
}


export const ServiceList = {
  data: []
}


export const ServiceItem = {
  id: "",
  name: "",
  description: ""
}

export const WelfareItem = {
  amount: 0.0,
  name: "",
  collectorName: ""
}

export const MembershipFormOne = {
  userId: "",
  fullName: "",
  surname: "",
  firstName: "",
  otherNames: "",
  dateOfBirth: null,
  gender: "",
  nationality: "",
  town: "",
  region: "",
  maritalStatus: "",
  contactAddress: "",
  firstTelephoneNumber: "",
  secondTelephoneNumber: "",
  emailAddress: "",
  permanentResidentialAddress: "",
  dateOfBaptism: null,
  churchOfBaptism: "",
  educationLevel: "",
  memberProfession: "",
  memberOccupation: "",
  spokenLanguage: [],
  writtenLanguage: [],
  hobbies: "",
}

export const MembershipFormTwo = {
  userId: "",
  spouseSurname: "",
  spouseFirstName: "",
  spouseOtherName: "",
  spouseFirstTelephoneNumber: "",
  spouseSecondTelephoneNumber: "",
  childInformation: [
    {
      nameOfChild: "",
      childDateOfBirth: null,
      telephoneNumber: ""
    }
  ],
  //Signature
  userSignature: "",
  // userSignatureDate: "",
  // createdAt: "",
  familyLeaderName: "",
  familyLeaderSignature: "",
  // familyLeaderSignatureDate: ""
}

export const MembershipFormThree = {
  userId: "string",
  fatherFullname: "",
  fatherSurname: "",
  fatherFirstName: "",
  fatherLastName: "",
  fatherOtherName: "",
  isBiologicalFather: true,
  isFatherAlive: true,
  motherFullname: "",
  motherSurname: "",
  motherFirstName: "",
  motherLastName: "",
  motherOtherName: "",
  isBiologicalMother: true,
  isMotherAlive: true,
  nextOfKinFullname: null,
  memberNextOfKinRelationship: null,
  nextOfKinFirstTelephoneNumber: null,
  nextOfKinSecondTelephoneNumber: null
}

export const WelfareTotals = {
  message: "",
  code: "",
  data: {
    welfareBySelf: 0.0,
    welfareByChurch: 0.0
  }
}

export const WelfareList = {
  message: "Successfully created",
  code: "200",
  data: {
    results: [
      {
        id: "",
        userId: "",
        transactionType: "",
        transactionAmount: 0.0,
        year: "",
        isWelfarePaidBySelf: true,
        isWelfarePaidByChurch: false,
        description: "",
        receivedBy: "",
        createdAt: ""
      }
    ],
    pageIndex: 0,
    totalPages: 1,
    pageSize: 10,
    totalCount: 1
  }
}

