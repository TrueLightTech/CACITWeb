export const MemberList = {
  pageIndex: 0,
  pageSize: 10,
  results: [ChurchMember],
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
  amountPaid:0,
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
  assignFamilyName:"",
  userName:"",
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
  results: [Offering]
}

export const IssuesList = {
  results: [Issue]
}

export const GroupList = {
  data: [ServiceItem]
}

export const ChurchFamilyList = {
  data: [ServiceItem]
}


export const ServiceList = {
  data: [ServiceItem]
}


export const ServiceItem = {
  id: "",
  name: "",
  description: ""
}

