import { images } from "./images";

/** Colours are the single source of truth for each collection's theme. */
export type Category = {
  slug: string;
  name: string;
  index: string;
  color: string;
  muted: string;
  gradient: string;
  tagline: [string, string];
  blurb: string;
  heroTitle: string;
  price: string;
  cover: string;
  slides: { src: string; caption: string }[];
  features: {
    title: [string, string];
    body: string;
    image: string;
  }[];
  pull: {
    text: string;
    name: string;
    source: string;
  };
  cta: string;
};

const grad = (a: string, b: string) =>
  `linear-gradient(135deg, ${a} 0%, ${b} 100%)`;

export const categories: Category[] = [
  {
    slug: "shoreline",
    name: "Dashboard",
    index: "01",
    color: "#1D2A48",
    muted: "#5E6A8E",
    gradient: grad("#2b3c63", "#8aa0b8"),

    tagline: ["real-time", "intelligence"],

    blurb:
      "Monitor distributed nodes, track system performance, and explore real-time intelligence through a unified dashboard.",

    heroTitle:
      "One intelligent dashboard to monitor, analyse, and control your distributed systems",

    price: "Real-time System Insights",

    cover: images.seaCover,

    slides: [
      {
        src: images.seaSlide1,
        caption: "Real-Time System Monitoring",
      },
      {
        src: images.seaSlide2,
        caption: "Connected Distributed Nodes",
      },
      {
        src: images.seaSlide3,
        caption: "Live Performance Intelligence",
      },
      {
        src: images.seaSlide4,
        caption: "Unified System Overview",
      },
    ],

    features: [
      {
        title: ["Live System", "Monitoring"],
        body:
          "Monitor connected nodes, system health, task execution, and live operational activity from a single interface.",
        image: images.seaF1,
      },
      {
        title: ["Centralised", "Visibility"],
        body:
          "Bring distributed resources together to understand system status, identify bottlenecks, and track important events.",
        image: images.seaF2,
      },
      {
        title: ["Intelligent", "Insights"],
        body:
          "Transform live system information into meaningful insights that support faster and more informed decisions.",
        image: images.seaF3,
      },
    ],

    pull: {
      text:
        "Better visibility creates better decisions. Understand your entire distributed system from one intelligent space.",
      name: "Distributed Intelligence",
      source: "/ Dashboard Overview / 2026",
    },

    cta: "Explore Dashboard",
  },

  {
    slug: "Dashboard",
    name: "Order Tracking",
    index: "02",
    color: "#2F5745",
    muted: "#7E978A",
    gradient: grad("#3a6a54", "#a9b9a0"),

    tagline: ["live order", "monitoring"],

    blurb:
      "Track distributed tasks, monitor execution progress, and follow every operation across connected nodes.",

    heroTitle:
      "Track every distributed task with real-time visibility and intelligent monitoring",

    price: "Live Task Monitoring",

    cover: images.greenCover,

    slides: [
      {
        src: images.greenSlide1,
        caption: "Live Task Execution",
      },
      {
        src: images.greenSlide2,
        caption: "Distributed Process Tracking",
      },
      {
        src: images.greenSlide3,
        caption: "Task Status and Progress",
      },
      {
        src: images.greenSlide4,
        caption: "Execution History",
      },
    ],

    features: [
      {
        title: ["Real-Time", "Tracking"],
        body:
          "Follow task status, execution progress, completion updates, and failures across distributed system components.",
        image: images.greenF1,
      },
      {
        title: ["Smart Task", "Coordination"],
        body:
          "Understand how tasks move between connected nodes and how distributed components coordinate their work.",
        image: images.greenF2,
      },
      {
        title: ["Failure", "Detection"],
        body:
          "Identify delayed or unsuccessful operations and make it easier to investigate problems before they affect the wider system.",
        image: images.greenF3,
      },
    ],

    pull: {
      text:
        "Every task tells a story. Track its journey, understand its status, and make distributed operations more transparent.",
      name: "Distributed Intelligence",
      source: "/ Operations Report / 2026",
    },

    cta: "Track Operations",
  },

  {
    slug: "cityscape",
    name: "Analytics",
    index: "03",
    color: "#33202F",
    muted: "#76606F",
    gradient: grad("#4a2e44", "#b39aa6"),

    tagline: ["data &", "insights"],

    blurb:
      "Transform distributed system data into meaningful insights with performance metrics, activity trends, and visual analytics.",

    heroTitle:
      "Turn distributed data into actionable intelligence with real-time analytics",

    price: "Performance Analytics",

    cover: images.cityCover,

    slides: [
      {
        src: images.citySlide1,
        caption: "System Performance Analytics",
      },
      {
        src: images.citySlide2,
        caption: "Data-Driven Intelligence",
      },
      {
        src: images.citySlide3,
        caption: "Performance Trends",
      },
      {
        src: images.citySlide4,
        caption: "Operational Data Visualisation",
      },
    ],

    features: [
      {
        title: ["Performance", "Metrics"],
        body:
          "Analyse response times, task throughput, resource utilisation, and system availability to evaluate operational performance.",
        image: images.cityF1,
      },
      {
        title: ["Predictive", "Analytics"],
        body:
          "Use historical patterns and available system data to identify potential bottlenecks and anticipate operational issues.",
        image: images.cityF2,
      },
      {
        title: ["Visual", "Intelligence"],
        body:
          "Present complex distributed data through clear charts, activity summaries, and performance comparisons.",
        image: images.cityF3,
      },
    ],

    pull: {
      text:
        "Data becomes powerful when it reveals patterns, explains performance, and helps people make better decisions.",
      name: "Distributed Intelligence",
      source: "/ Analytics Outlook / 2026",
    },

    cta: "Explore Analytics",
  },

  {
    slug: "singular",
    name: "Intelligence Flow",
    index: "04",
    color: "#1B191D",
    muted: "#5F5B61",
    gradient: grad("#2a272d", "#8f8a90"),

    tagline: ["decision &", "automation"],

    blurb:
      "Understand how distributed nodes communicate, exchange information, and coordinate intelligent decisions across the system.",

    heroTitle:
      "Connect distributed nodes through intelligent coordination and automated decision-making",

    price: "Distributed Intelligence",

    cover: images.rareCover,

    slides: [
      {
        src: images.rareSlide1,
        caption: "Distributed Node Communication",
      },
      {
        src: images.rareSlide2,
        caption: "Intelligent Decision Flow",
      },
      {
        src: images.rareSlide3,
        caption: "Coordinated System Operations",
      },
      {
        src: images.rareSlide4,
        caption: "Automated Intelligence",
      },
    ],

    features: [
      {
        title: ["Connected", "Nodes"],
        body:
          "Understand how independent components communicate, exchange information, and collaborate within a distributed architecture.",
        image: images.rareF1,
      },
      {
        title: ["Intelligent", "Decisions"],
        body:
          "Use system rules, operational signals, and available data to support intelligent decisions across distributed components.",
        image: images.rareF2,
      },
      {
        title: ["Adaptive", "Automation"],
        body:
          "Build workflows that respond to changing system conditions and reduce repetitive manual operational tasks.",
        image: images.rareF3,
      },
    ],

    pull: {
      text:
        "Intelligence emerges when connected systems share information, coordinate decisions, and work together as one.",
      name: "Distributed Intelligence",
      source: "/ Intelligence Brief / 2026",
    },

    cta: "Explore Intelligence",
  },
];

export const bySlug = (slug: string) =>
  categories.find((c) => c.slug === slug);

export const nextOf = (slug: string) => {
  const i = categories.findIndex((c) => c.slug === slug);
  return categories[(i + 1) % categories.length];
};