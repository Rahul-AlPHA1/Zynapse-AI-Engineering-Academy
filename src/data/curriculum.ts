import { interviewPlanContent } from './interviewPlan';
export interface Topic {
  id: string;
  title: string;
  content?: string;
}

export interface Section {
  id: string;
  title: string;
  topics: Topic[];
}

export interface Module {
  id: string;
  title: string;
  icon: string;
  sections: Section[];
}

export const curriculum: Module[] = [
  {
    id: 'interview-crack-plan',
    title: "Custom Interview Strategy",
    icon: 'Target',
    sections: [
      {
        id: 'interview-prep',
        title: 'Interview Preparation',
        topics: [
          { id: 'ai-plan-generator', title: '🚀 AI Plan Generator (JD Based)' }
        ]
      }
    ]
  },
  {
    id: 'java-mastery',
    title: 'Java Complete Syllabus',
    icon: 'Code2',
    sections: [
      {
        id: 'java-basics',
        title: '1. Java Basics',
        topics: [
          { id: 'what-is-java', title: 'What is Java' },
          { id: 'history-of-java', title: 'History of Java' },
          { id: 'features-of-java', title: 'Features of Java' },
          { id: 'cpp-vs-java', title: 'C++ vs Java' },
          { id: 'hello-world', title: 'Java Hello World Program' },
          { id: 'internal-details', title: 'Java Program Internal Details' },
          { id: 'set-path', title: 'How to set path in Java?' },
          { id: 'jdk-jre-jvm', title: 'JDK, JRE and JVM' },
          { id: 'jvm-machine', title: 'JVM: Java Virtual Machine' },
          { id: 'variables', title: 'Java Variables' },
          { id: 'identifiers', title: 'Identifiers in Java' },
          { id: 'data-types', title: 'Java Data Types' },
          { id: 'type-casting', title: 'Type Casting in Java' },
          { id: 'unicode', title: 'Unicode System in Java' },
          { id: 'operators', title: 'Operators in Java' },
          { id: 'keywords', title: 'Java Keywords' },
          { id: 'if-else', title: 'Java If-else' },
          { id: 'switch', title: 'Java Switch' },
          { id: 'for-loop', title: 'Java For Loop' },
          { id: 'while-loop', title: 'Java While Loop' },
          { id: 'do-while', title: 'Java Do While Loop' },
          { id: 'break', title: 'Java Break' },
          { id: 'continue', title: 'Java Continue' },
          { id: 'comments', title: 'Java Comments' },
          { id: 'programs', title: 'Java Programs' }
        ]
      },
      {
        id: 'java-oops',
        title: '2. Java OOPs Concepts',
        topics: [
          { id: 'oops-concepts-intro', title: 'Java OOPs Concepts' },
          { id: 'naming-conventions', title: 'Java Naming Conventions' },
          { id: 'object-class', title: 'Object and Class in Java' },
          { id: 'constructor', title: 'Constructor in Java' },
          { id: 'static-keyword', title: 'static keyword in Java' },
          { id: 'this-keyword', title: 'this keyword in Java' },
          { id: 'methods', title: 'Methods in Java' },
          { id: 'call-method', title: 'How to Call a Method in Java' },
          { id: 'recursion', title: 'Recursion in Java' },
          { id: 'call-by-value', title: 'Call By Value and Call By Reference' },
          { id: 'inheritance', title: 'Inheritance in Java' },
          { id: 'aggregation', title: 'Aggregation in Java' },
          { id: 'method-overloading', title: 'Method Overloading in Java' },
          { id: 'method-overriding', title: 'Method Overriding in Java' },
          { id: 'covariant', title: 'Covariant Return Type in Java' },
          { id: 'super-keyword', title: 'Java super keyword' },
          { id: 'instance-initializer', title: 'Java Instance Initializer block' },
          { id: 'final-keyword', title: 'Java final keyword' },
          { id: 'polymorphism', title: 'Polymorphism in Java' },
          { id: 'static-dynamic-binding', title: 'Static and Dynamic Binding' },
          { id: 'instanceof', title: 'Java instanceof operator' },
          { id: 'abstract-class', title: 'Abstract class in Java' },
          { id: 'interface', title: 'Interface in Java' },
          { id: 'abstract-vs-interface', title: 'Abstract class vs Interface' },
          { id: 'package', title: 'Package in Java' },
          { id: 'access-modifiers', title: 'Access Modifiers in Java' },
          { id: 'encapsulation', title: 'Encapsulation in Java' },
        ]
      },
      {
        id: 'java-core-advanced',
        title: '3. Java Core & Intermediate',
        topics: [
          { id: 'array', title: 'Java Array' },
          { id: 'jagged-array', title: 'Java Jagged Array' },
          { id: 'array-programs', title: 'Java Array Programs' },
          { id: 'array-methods', title: 'Java Array Methods' },
          { id: 'object-class-misc', title: 'Object class in Java' },
          { id: 'object-cloning', title: 'Object Cloning' },
          { id: 'math-class', title: 'Java Math class' },
          { id: 'wrapper-class', title: 'Wrapper Class in Java' },
          { id: 'strictfp', title: 'strictfp keyword' },
          { id: 'command-line', title: 'Command Line Argument in Java' },
          { id: 'object-vs-class', title: 'Object vs Class' },
          { id: 'overloading-vs-overriding', title: 'Method Overloading vs Method Overriding' },
          { id: 'string', title: 'Java String' },
          { id: 'immutable-string', title: 'Why String is Immutable in Java?' },
          { id: 'string-comparison', title: 'String Comparison in Java' },
          { id: 'string-concatenation', title: 'String Concatenation in Java' },
          { id: 'substring', title: 'Substring in Java' },
          { id: 'string-methods', title: 'Methods of String class' },
          { id: 'stringbuffer', title: 'StringBuffer in Java' },
          { id: 'stringbuilder', title: 'StringBuilder in Java' },
          { id: 'string-vs-stringbuffer', title: 'String vs StringBuffer in Java' },
          { id: 'stringbuffer-vs-stringbuilder', title: 'StringBuffer vs StringBuilder' },
          { id: 'immutable-class', title: 'How to Create Immutable class in Java?' },
          { id: 'tostring', title: 'Java toString method' },
          { id: 'stringtokenizer', title: 'StringTokenizer class in Java' },
          { id: 'string-faqs', title: 'Java String FAQs' },
          { id: 'regex', title: 'Java Regex' },
          { id: 'exceptions', title: 'Java Exceptions' },
          { id: 'try-catch', title: 'Java Try-catch block' },
          { id: 'multiple-catch', title: 'Java Multiple Catch Block' },
          { id: 'nested-try', title: 'Java Nested try' },
          { id: 'finally-block', title: 'Java Finally Block' },
          { id: 'throw-keyword', title: 'Java Throw Keyword' },
          { id: 'exception-propagation', title: 'Java Exception Propagation' },
          { id: 'throws-keyword', title: 'Java Throws Keyword' },
          { id: 'throw-vs-throws', title: 'Java Throw vs Throws' },
          { id: 'final-finally-finalize', title: 'Final vs Finally vs Finalize' },
          { id: 'exception-overriding', title: 'Exception Handling with Method Overriding' },
          { id: 'custom-exceptions', title: 'Java Custom Exceptions' },
          { id: 'inner-class-intro', title: 'Java inner class' },
          { id: 'member-inner', title: 'Member Inner class' },
          { id: 'anonymous-inner', title: 'Anonymous Inner class' },
          { id: 'local-inner', title: 'Local Inner class' },
          { id: 'static-nested', title: 'static nested class' },
          { id: 'nested-interface', title: 'Nested Interface' },
        ]
      },
      {
        id: 'java-advanced',
        title: '4. Java Advanced',
        topics: [
          { id: 'multithreading-intro', title: 'Multithreading in Java' },
          { id: 'thread-lifecycle', title: 'Life Cycle of a Thread' },
          { id: 'create-thread', title: 'How to Create Thread' },
          { id: 'thread-scheduler', title: 'Thread Scheduler in Java' },
          { id: 'sleeping-thread', title: 'Sleeping a thread in Java' },
          { id: 'start-twice', title: 'Can we start a thread twice?' },
          { id: 'call-run', title: 'What if we Call run() method' },
          { id: 'naming-thread', title: 'Naming a thread in Java' },
          { id: 'thread-priority', title: 'Thread Priority in Java' },
          { id: 'daemon-thread', title: 'Daemon Thread in Java' },
          { id: 'thread-pool', title: 'Thread Pool in Java' },
          { id: 'threadgroup', title: 'ThreadGroup in Java' },
          { id: 'shutdownhook', title: 'ShutdownHook Thread in Java' },
          { id: 'multitasking', title: 'Multitasking in Multithreading' },
          { id: 'garbage-collection-thread', title: 'Garbage Collection in Java' },
          { id: 'runtime-class', title: 'Java Runtime class' },
          { id: 'sync-intro', title: 'Synchronization in java' },
          { id: 'sync-block', title: 'Java Synchronized Block' },
          { id: 'static-sync', title: 'Java Static Synchronization' },
          { id: 'deadlock', title: 'Deadlock in Java' },
          { id: 'inter-thread', title: 'Inter-thread Communication in Java' },
          { id: 'interrupting-thread', title: 'Interrupting a Thread in Java' },
          { id: 'reentrant-monitor', title: 'Reentrant Monitor in Java' },
          { id: 'io-intro', title: 'Java Input/Output' },
          { id: 'fileoutputstream', title: 'Java FileOutputStream' },
          { id: 'fileinputstream', title: 'Java FileInputStream' },
          { id: 'bufferedoutputstream', title: 'Java BufferedOutputStream' },
          { id: 'bufferedinputstream', title: 'Java BufferedInputStream' },
          { id: 'file-handling', title: 'File Handling in Java' },
          { id: 'file-class', title: 'Java File class' },
          { id: 'create-file', title: 'How to Create a File in Java' },
          { id: 'read-file', title: 'How to Read File in Java' },
          { id: 'delete-file', title: 'How to Delete a File in Java' },
          { id: 'serialization', title: 'Java Serialization' },
          { id: 'transient', title: 'Java transient keyword' },
          { id: 'networking-concepts', title: 'Java Networking Concepts' },
          { id: 'socket-programming', title: 'Socket Programming in Java' },
          { id: 'reflection-api', title: 'Java Reflection API' },
          { id: 'memory-management-intro', title: 'Java Memory Management' },
          { id: 'stack-vs-heap', title: 'Stack vs Heap Memory in Java' },
          { id: 'garbage-collection', title: 'Java Garbage Collection' },
          { id: 'how-gc-works', title: 'How Garbage Collection Works in Java?' },
          { id: 'memory-leaks', title: 'Memory Leaks in Java' },
        ]
      },
      {
        id: 'java-collections-jdbc',
        title: '5. Collections, Data Structures & JDBC',
        topics: [
          { id: 'collections-intro', title: 'Collections in Java' },
          { id: 'arraylist', title: 'Java ArrayList' },
          { id: 'linkedlist', title: 'Java LinkedList' },
          { id: 'arraylist-vs-linkedlist', title: 'ArrayList vs LinkedList' },
          { id: 'list-interface', title: 'Java List Interface' },
          { id: 'linkedhashset', title: 'Java LinkedHashSet' },
          { id: 'treeset', title: 'Java TreeSet' },
          { id: 'queue-priorityqueue', title: 'Queue & PriorityQueue' },
          { id: 'deque-arraydeque', title: 'Deque & ArrayDeque' },
          { id: 'map-interface', title: 'Java Map Interface' },
          { id: 'hashmap', title: 'Java HashMap' },
          { id: 'working-hashmap', title: 'Working of HashMap' },
          { id: 'linkedhashmap', title: 'Java LinkedHashMap' },
          { id: 'treemap', title: 'Java TreeMap' },
          { id: 'hashtable', title: 'Java Hashtable' },
          { id: 'hashmap-vs-hashtable', title: 'HashMap vs Hashtable' },
          { id: 'collections-class', title: 'Java Collections class' },
          { id: 'sorting-collections', title: 'Sorting Collections in Java' },
          { id: 'comparable', title: 'Comparable interface in Java' },
          { id: 'comparator', title: 'Comparator interface in Java' },
          { id: 'comparable-vs-comparator', title: 'Comparable vs Comparator' },
          { id: 'ds-intro', title: 'Data Structures in Java' },
          { id: 'linear-search', title: 'Linear Search in Java' },
          { id: 'binary-search', title: 'Binary Search in Java' },
          { id: 'insertion-sort', title: 'Insertion Sort in Java' },
          { id: 'selection-sort', title: 'Selection Sort in Java' },
          { id: 'bubble-sort', title: 'Bubble Sort in Java' },
          { id: 'merge-sort', title: 'Merge Sort in Java' },
          { id: 'jdbc-intro', title: 'JDBC Introduction' },
          { id: 'jdbc-driver', title: 'JDBC Driver' },
          { id: 'jdbc-steps', title: 'Java Database Connectivity with 5 Steps' },
          { id: 'jdbc-oracle', title: 'Connectivity with Oracle' },
          { id: 'jdbc-mysql', title: 'Connectivity with MySQL' },
          { id: 'drivermanager', title: 'DriverManager' },
          { id: 'connection', title: 'Connection' },
          { id: 'statement', title: 'Statement' },
          { id: 'resultset', title: 'ResultSet' },
          { id: 'preparedstatement', title: 'PreparedStatement' },
          { id: 'transaction-management', title: 'Transaction Management' },
          { id: 'batch-processing', title: 'Batch Processing' },
          { id: 'java-8-features', title: 'Java 8 Features' },
          { id: 'interview-questions', title: '300+ Java Interview Questions' },
        ]
      },
      {
        id: 'java-mastery-quizzes',
        title: 'Quizzes & Assessments',
        topics: [
          { id: 'java-mastery-quiz-beginner', title: 'Beginner Quiz (50 Questions)' },
          { id: 'java-mastery-quiz-intermediate', title: 'Intermediate Quiz (50 Questions)' },
          { id: 'java-mastery-quiz-advanced', title: 'Advanced Quiz (50 Questions)' }
        ]
      }
    ]
  },
  {
    id: 'spring-boot-mastery',
    title: 'Spring Boot Complete Syllabus',
    icon: 'Cpu',
    sections: [
      {
        id: 'sb-basics',
        title: '1. Spring Boot Basics',
        topics: [
          { id: 'sb-tutorial', title: 'Spring Boot Tutorial' },
          { id: 'sb-version', title: 'Spring Boot Version' },
          { id: 'spring-vs-springboot', title: 'Spring vs Spring Boot vs Spring MVC' },
          { id: 'sb-architecture', title: 'Spring Boot Architecture' },
          { id: 'sb-features', title: 'Spring Boot Features' },
          { id: 'sb-maven', title: 'Spring Maven Project' },
          { id: 'sb-create-project', title: 'Creating Project' },
          { id: 'sb-initializr', title: 'Spring Initializr' },
          { id: 'sb-sts', title: 'Download and Install STS IDE' },
          { id: 'sb-cli', title: 'Spring Boot CLI' },
          { id: 'sb-example-sts', title: 'Spring Boot Example Using STS' },
          { id: 'sb-components', title: 'Project Components' },
          { id: 'sb-hello-world', title: 'Hello World Example' }
        ]
      },
      {
        id: 'sb-core',
        title: '2. Spring Boot Core Concepts',
        topics: [
          { id: 'sb-annotations', title: 'Spring Boot Annotations' },
          { id: 'sb-dependency-management', title: 'Spring Boot Dependency Management' },
          { id: 'sb-application-properties', title: 'Spring Boot Application Properties' },
          { id: 'sb-starters-intro', title: 'Spring Boot Starters' },
          { id: 'sb-starter-parent', title: 'Spring Boot Starter Parent' },
          { id: 'sb-starter-web', title: 'Spring Boot Starter Web' },
          { id: 'sb-starter-data-jpa', title: 'Spring Boot Starter Data JPA' },
          { id: 'sb-actuator', title: 'Spring Boot Actuator' },
          { id: 'sb-starter-test', title: 'Spring Boot Starter Test' },
          { id: 'sb-devtools', title: 'Spring Boot DevTools' },
          { id: 'sb-autoconfig-deep', title: 'Spring Boot Auto-configuration' },
        ]
      },
      {
        id: 'sb-aop-db',
        title: '3. Spring Boot AOP & Database',
        topics: [
          { id: 'sb-aop-intro', title: 'Spring Boot AOP' },
          { id: 'sb-aop-before', title: 'AOP Before Advice' },
          { id: 'sb-aop-after', title: 'AOP After Advice' },
          { id: 'sb-aop-around', title: 'AOP Around Advice' },
          { id: 'sb-aop-after-returning', title: 'Spring Boot AOP After Returning Advice' },
          { id: 'sb-aop-after-throwing', title: 'After Throwing Advice' },
          { id: 'sb-database-intro', title: 'Spring Boot Database' },
          { id: 'sb-jpa', title: 'Spring Boot JPA' },
          { id: 'sb-jdbc', title: 'Spring Boot JDBC' },
          { id: 'sb-jdbc-example', title: 'Spring Boot JDBC Example' },
          { id: 'sb-h2', title: 'Spring Boot H2 Database' },
          { id: 'sb-crud', title: 'Spring Boot CRUD Operations' },
          { id: 'sb-view', title: 'Spring Boot View' },
          { id: 'sb-thymeleaf', title: 'Spring Boot Thymeleaf' },
          { id: 'sb-caching', title: 'Spring Boot Caching' },
          { id: 'sb-cache-provider', title: 'Spring Boot Cache Provider' },
          { id: 'sb-ehcaching', title: 'Spring Boot EhCaching' },
        ]
      },
      {
        id: 'sb-rest-basic',
        title: '4. RESTful Web Services (Basic)',
        topics: [
          { id: 'sb-rest-example', title: 'Spring Boot REST Example' },
          { id: 'sb-rest-intro', title: 'Introduction to RESTful Web Services With Spring Boot' },
          { id: 'sb-rest-init', title: 'Initializing a RESTful Web Services' },
          { id: 'sb-rest-autoconfig', title: 'Spring Boot Auto Configuration and Dispatcher Servlet' },
          { id: 'sb-rest-path-variable', title: 'Enhancing the Hello World Service with a Path Variable' },
          { id: 'sb-rest-post', title: 'Implementing the POST Method to create User Resource' },
          { id: 'sb-rest-exception-404', title: 'Implementing Exception Handling- 404 Resource Not Found' },
          { id: 'sb-rest-exception-generic', title: 'Implementing Generic Exception Handling for all Resources' },
          { id: 'sb-rest-delete', title: 'Implementing DELETE Method to Delete a User Resource' },
          { id: 'sb-rest-validations', title: 'Implementing Validations for RESTful Services' },
        ]
      },
      {
        id: 'sb-rest-advanced',
        title: '5. RESTful Web Services (Advanced)',
        topics: [
          { id: 'sb-rest-hateoas', title: 'Implementing HATEOAS for RESTful Services' },
          { id: 'sb-rest-i18n', title: 'Internationalization of RESTful Services' },
          { id: 'sb-rest-content-negotiation', title: 'Content Negotiation Implementing Support for XML' },
          { id: 'sb-rest-swagger-auto', title: 'Configuring Auto Generation of Swagger Documentation' },
          { id: 'sb-rest-swagger-intro', title: 'Introduction to Swagger Documentation Format' },
          { id: 'sb-rest-swagger-custom', title: 'Enhancing Swagger Documentation with Custom Annotations' },
          { id: 'sb-rest-actuator-monitoring', title: 'Monitoring APIs with Spring Boot Actuator' },
          { id: 'sb-rest-static-filtering', title: 'Implementing Static Filtering for RESTful Services' },
          { id: 'sb-rest-dynamic-filtering', title: 'Implementing Dynamic Filtering for RESTful Services' },
          { id: 'sb-rest-versioning', title: 'Versioning RESTful Web Services-Basic Approach With URIs' },
          { id: 'sb-rest-basic-auth', title: 'Implementing Basic Authentication with Spring Security' },
          { id: 'sb-rest-jpa-connect', title: 'Connecting RESTful Services to JPA' },
          { id: 'sb-rest-jpa-get', title: 'Updating GET Methods on User Resource to Use JPA' },
          { id: 'sb-rest-jpa-post-delete', title: 'Updating POST and DELETE methods on UserResource to use JPA' },
          { id: 'sb-rest-jpa-relationships', title: 'Creating Post Entity and Many to One Relationship with User Entity' },
          { id: 'sb-rest-jpa-get-posts', title: 'Implementing a GET service to retrieve all Posts of a User' },
          { id: 'sb-rest-jpa-post-posts', title: 'Implementing POST Service to Create a Post for a User' },
          { id: 'sb-rest-richardson', title: 'Richardson Maturity Model' },
          { id: 'sb-rest-best-practices', title: 'RESTful Web Services Best Practice' },
        ]
      },
      {
        id: 'sb-deployment-misc',
        title: '6. Deployment & Interview',
        topics: [
          { id: 'sb-multi-module', title: 'Multi Module Project' },
          { id: 'sb-packaging', title: 'Spring Boot Packaging' },
          { id: 'sb-tool-suite', title: 'Tool Suite' },
          { id: 'sb-tomcat-deploy', title: 'Project Deployment Using Tomcat' },
          { id: 'sb-run-app', title: 'How to Run Spring Boot Application' },
          { id: 'sb-change-port', title: 'Spring Boot Change Port' },
          { id: 'sb-starter-wizard', title: 'Spring Starter Project Wizard' },
          { id: 'sb-interview-questions', title: '300+ Spring Boot Interview Questions' },
        ]
      },
      {
        id: 'spring-boot-mastery-quizzes',
        title: 'Quizzes & Assessments',
        topics: [
          { id: 'spring-boot-mastery-quiz-beginner', title: 'Beginner Quiz (50 Questions)' },
          { id: 'spring-boot-mastery-quiz-intermediate', title: 'Intermediate Quiz (50 Questions)' },
          { id: 'spring-boot-mastery-quiz-advanced', title: 'Advanced Quiz (50 Questions)' }
        ]
      }
    ]
  },
  {
    id: 'microservices-mastery',
    title: 'Microservices Architecture',
    icon: 'Network',
    sections: [
      {
        id: 'ms-basics',
        title: '1. Microservices Basics',
        topics: [
          { id: 'ms-what-is', title: 'What are Microservices?' },
          { id: 'ms-working', title: 'How Microservices Work' },
          { id: 'ms-vs-monolithic', title: 'Microservices Vs Monolithic Architecture' },
          { id: 'ms-applications', title: 'Applications of Microservices' },
          { id: 'ms-challenges', title: 'Challenges in Microservices' }
        ]
      },
      {
        id: 'ms-components',
        title: '2. Core Components',
        topics: [
          { id: 'ms-comp-microservices', title: '1. Microservices (Independent Services)' },
          { id: 'ms-comp-api-gateway', title: '2. API Gateway' },
          { id: 'ms-comp-service-registry', title: '3. Service Registry and Discovery' },
          { id: 'ms-comp-load-balancer', title: '4. Load Balancer' },
          { id: 'ms-comp-containerization', title: '5. Containerization (Docker/K8s)' },
          { id: 'ms-comp-event-bus', title: '6. Event Bus / Message Broker' },
          { id: 'ms-comp-db-per-service', title: '7. Database per Microservice' },
          { id: 'ms-comp-caching', title: '8. Caching' },
          { id: 'ms-comp-fault-tolerance', title: '9. Fault Tolerance and Resilience' },
        ]
      },
      {
        id: 'ms-patterns',
        title: '3. Design Patterns (Advanced)',
        topics: [
          { id: 'ms-pattern-api-gateway', title: 'API Gateway Pattern' },
          { id: 'ms-pattern-service-registry', title: 'Service Registry Pattern' },
          { id: 'ms-pattern-circuit-breaker', title: 'Circuit Breaker Pattern' },
          { id: 'ms-pattern-saga', title: 'Saga Pattern' },
          { id: 'ms-pattern-event-sourcing', title: 'Event Sourcing Pattern' },
          { id: 'ms-pattern-strangler', title: 'Strangler Pattern' },
          { id: 'ms-pattern-bulkhead', title: 'Bulkhead Pattern' },
          { id: 'ms-pattern-api-composition', title: 'API Composition Pattern' },
          { id: 'ms-pattern-cqrs', title: 'CQRS Design Pattern' },
        ]
      },
      {
        id: 'ms-realworld',
        title: '4. Real-World & Interview',
        topics: [
          { id: 'ms-amazon-example', title: 'Real-World Example: Amazon E-Commerce' },
          { id: 'ms-migration-steps', title: 'Migrating from Monolithic to Microservices' },
          { id: 'ms-interview-questions', title: '300+ Microservices Interview Questions' },
        ]
      },
      {
        id: 'microservices-mastery-quizzes',
        title: 'Quizzes & Assessments',
        topics: [
          { id: 'microservices-mastery-quiz-beginner', title: 'Beginner Quiz (50 Questions)' },
          { id: 'microservices-mastery-quiz-intermediate', title: 'Intermediate Quiz (50 Questions)' },
          { id: 'microservices-mastery-quiz-advanced', title: 'Advanced Quiz (50 Questions)' }
        ]
      }
    ]
  },
  {
    id: 'react-mastery',
    title: 'React.js Complete Syllabus',
    icon: 'LayoutTemplate',
    sections: [
      {
        id: 'react-basics',
        title: '1. React Basics',
        topics: [
          { id: 'react-version', title: 'React Version' },
          { id: 'react-installation', title: 'React Installation' },
          { id: 'create-react-app', title: 'create-react-app' },
          { id: 'react-features', title: 'React Features' },
          { id: 'react-pros-cons', title: 'Pros & Cons' },
          { id: 'react-vs-angular', title: 'ReactJS vs AngularJS' },
          { id: 'react-vs-native', title: 'ReactJS vs ReactNative' },
          { id: 'react-vs-vue', title: 'React vs Vue' }
        ]
      },
      {
        id: 'react-core',
        title: '2. React Core Concepts',
        topics: [
          { id: 'react-jsx', title: 'React JSX' },
          { id: 'react-components', title: 'React Components' },
          { id: 'react-state', title: 'React State' },
          { id: 'react-props', title: 'React Props' },
          { id: 'react-props-validation', title: 'React Props Validation' },
          { id: 'react-state-vs-props', title: 'React State vs Props' },
          { id: 'react-constructor', title: 'React Constructor' },
          { id: 'react-component-api', title: 'React Component API' },
          { id: 'react-lifecycle', title: 'Component Life Cycle' },
        ]
      },
      {
        id: 'react-ui',
        title: '3. React UI & Interaction',
        topics: [
          { id: 'react-forms', title: 'React Forms' },
          { id: 'react-controlled-uncontrolled', title: 'Controlled vs Uncontrolled' },
          { id: 'react-events', title: 'React Events' },
          { id: 'react-conditional-rendering', title: 'Conditional Rendering' },
          { id: 'react-lists', title: 'React Lists' },
          { id: 'react-keys', title: 'React Keys' },
          { id: 'react-refs', title: 'React Refs' },
          { id: 'react-fragments', title: 'React Fragments' },
          { id: 'react-css', title: 'React CSS' },
          { id: 'react-animation', title: 'React Animation' },
          { id: 'react-bootstrap', title: 'React Bootstrap' },
          { id: 'react-map', title: 'React Map' },
          { id: 'react-table', title: 'React Table' },
        ]
      },
      {
        id: 'react-advanced',
        title: '4. React Advanced',
        topics: [
          { id: 'react-router', title: 'React Router' },
          { id: 'react-hoc', title: 'Higher-Order Components' },
          { id: 'react-code-splitting', title: 'React Code Splitting' },
          { id: 'react-context', title: 'React Context' },
          { id: 'react-hooks', title: 'React Hooks' },
          { id: 'react-portals', title: 'React Portals' },
          { id: 'react-error-boundaries', title: 'React Error Boundaries' },
        ]
      },
      {
        id: 'react-architecture',
        title: '5. Architecture & State Management',
        topics: [
          { id: 'react-flux-concept', title: 'React Flux Concept' },
          { id: 'react-flux-vs-mvc', title: 'React Flux Vs MVC' },
          { id: 'react-redux', title: 'React Redux' },
          { id: 'react-redux-example', title: 'React Redux Example' },
          { id: 'react-interview-questions', title: 'React Interview Questions' },
        ]
      },
      {
        id: 'react-mastery-quizzes',
        title: 'Quizzes & Assessments',
        topics: [
          { id: 'react-mastery-quiz-beginner', title: 'Beginner Quiz (50 Questions)' },
          { id: 'react-mastery-quiz-intermediate', title: 'Intermediate Quiz (50 Questions)' },
          { id: 'react-mastery-quiz-advanced', title: 'Advanced Quiz (50 Questions)' }
        ]
      }
    ]
  },
  {
    id: 'javascript-mastery',
    title: 'JavaScript Complete Syllabus',
    icon: 'Terminal',
    sections: [
      {
        id: 'js-basics',
        title: '1. JavaScript Basics',
        topics: [
          { id: 'js-tutorial', title: 'JavaScript Tutorial' },
          { id: 'js-features', title: 'Features of JavaScript' },
          { id: 'js-versions', title: 'JavaScript Versions' },
          { id: 'js-vs-java', title: 'Difference between Java and JavaScript' },
          { id: 'js-hello-world', title: 'Hello World Program in JavaScript' },
          { id: 'js-syntax', title: 'JavaScript Syntax' },
          { id: 'js-operators', title: 'JavaScript Operators' },
          { id: 'js-comments', title: 'JavaScript Comments' }
        ]
      },
      {
        id: 'js-variables-datatypes',
        title: '2. Variables and Data Types',
        topics: [
          { id: 'js-variables', title: 'JavaScript Variables' },
          { id: 'js-global-variables', title: 'JavaScript Global Variables' },
          { id: 'js-data-types', title: 'JavaScript Data Types' },
          { id: 'js-var', title: 'JavaScript var' },
          { id: 'js-let', title: 'JavaScript let' },
          { id: 'js-const', title: 'JavaScript const' },
          { id: 'js-var-let-const-diff', title: 'Difference between var, let, and const in JavaScript' },
        ]
      },
      {
        id: 'js-control-statements',
        title: '3. Control Statements',
        topics: [
          { id: 'js-if-else', title: 'JavaScript if-else' },
          { id: 'js-switch', title: 'JavaScript Switch' },
          { id: 'js-loops', title: 'JavaScript Loops' },
          { id: 'js-for-loop', title: 'JavaScript for Loop' },
          { id: 'js-while-loop', title: 'JavaScript while Loop' },
          { id: 'js-do-while-loop', title: 'JavaScript do-while Loop' },
          { id: 'js-for-of-loop', title: 'Javascript for...of Loop' },
          { id: 'js-for-in-loop', title: 'JavaScript for...in Loop' },
          { id: 'js-return', title: 'JavaScript return Statement' },
        ]
      },
      {
        id: 'js-functions',
        title: '4. JavaScript Functions',
        topics: [
          { id: 'js-functions-intro', title: 'JavaScript Functions' },
          { id: 'js-function-parameters', title: 'JavaScript Function Parameters' },
          { id: 'js-default-parameters', title: 'JavaScript Default Parameters' },
          { id: 'js-hoisting', title: 'JavaScript Hoisting' },
          { id: 'js-anonymous-function', title: 'Anonymous Function in JavaScript' },
          { id: 'js-function-call', title: 'JavaScript Function - call()' },
          { id: 'js-function-apply', title: 'JavaScript Function - apply()' },
          { id: 'js-function-bind', title: 'JavaScript Function - bind()' },
        ]
      },
      {
        id: 'js-objects-arrays',
        title: '5. Objects & Built-in Types',
        topics: [
          { id: 'js-objects', title: 'JavaScript Objects' },
          { id: 'js-arrays', title: 'JavaScript Arrays' },
          { id: 'js-array-methods', title: 'JavaScript Array Methods' },
          { id: 'js-strings', title: 'JavaScript Strings' },
          { id: 'js-string-methods', title: 'JavaScript String Methods' },
          { id: 'js-date', title: 'JavaScript Date' },
          { id: 'js-math', title: 'JavaScript Math' },
          { id: 'js-number', title: 'JavaScript Number' },
          { id: 'js-boolean', title: 'JavaScript Boolean' },
        ]
      },
      {
        id: 'js-advanced-functions',
        title: '6. Advanced Functions',
        topics: [
          { id: 'js-closures', title: 'JavaScript Closures' },
          { id: 'js-arrow-function', title: 'Arrow Function in JavaScript' },
          { id: 'js-callback-function', title: 'Callback Function in JavaScript' },
          { id: 'js-higher-order-functions', title: 'Higher-Order Functions in JavaScript' },
          { id: 'js-settimeout', title: 'JavaScript setTimeout()' },
          { id: 'js-setinterval', title: 'JavaScript setInterval()' },
          { id: 'js-event-loop', title: 'Event Loop in JavaScript' },
        ]
      },
      {
        id: 'js-promises-async',
        title: '7. Promises & Async/Await',
        topics: [
          { id: 'js-promises', title: 'JavaScript Promises' },
          { id: 'js-promise-chaining', title: 'Promise Chaining in JavaScript' },
          { id: 'js-promise-any', title: 'JavaScript Promise.any() Method' },
          { id: 'js-promise-allsettled', title: 'JavaScript Promise.allSettled()' },
          { id: 'js-promise-finally', title: 'JavaScript Promise.finally()' },
          { id: 'js-async-await', title: 'JavaScript Async/Await' },
        ]
      },
      {
        id: 'js-dom',
        title: '8. Document Object Model (DOM)',
        topics: [
          { id: 'js-dom-intro', title: 'JavaScript DOM (Document Object Model)' },
          { id: 'js-getelementbyid', title: 'getElementById' },
          { id: 'js-getelementsbyclassname', title: 'GetElementsByClassName()' },
          { id: 'js-getelementsbyname', title: 'getElementsByName' },
          { id: 'js-getelementsbytagname', title: 'getElementsByTagName' },
          { id: 'js-innerhtml', title: 'JavaScript innerHTML property' },
          { id: 'js-innertext', title: 'JavaScript innerText property' },
        ]
      },
      {
        id: 'js-json-validation-cookies',
        title: '9. JSON, Validation & Cookies',
        topics: [
          { id: 'js-json', title: 'JavaScript JSON' },
          { id: 'js-json-parse', title: 'JSON.parse()' },
          { id: 'js-json-stringify', title: 'JSON.stringify()' },
          { id: 'js-form-validation', title: 'JS form validation' },
          { id: 'js-email-validation', title: 'JavaScript email validation' },
          { id: 'js-cookies', title: 'JavaScript Cookies' },
          { id: 'js-cookie-attributes', title: 'Cookie Attributes' },
          { id: 'js-cookie-multiple', title: 'Cookie with multiple Name' },
          { id: 'js-delete-cookies', title: 'Deleting Cookies' },
        ]
      },
      {
        id: 'js-exceptions-collections-events',
        title: '10. Exceptions, Collections & Events',
        topics: [
          { id: 'js-exception-handling', title: 'JavaScript Exception Handling' },
          { id: 'js-try-catch', title: 'JavaScript try-catch' },
          { id: 'js-map', title: 'JavaScript Map' },
          { id: 'js-set', title: 'JavaScript Set' },
          { id: 'js-events-intro', title: 'JavaScript Events' },
          { id: 'js-addeventlistener', title: 'JavaScript addEventListener()' },
          { id: 'js-onclick', title: 'JavaScript onclick event' },
          { id: 'js-dblclick', title: 'JavaScript dblclick event' },
          { id: 'js-onload', title: 'JavaScript onload event' },
          { id: 'js-onresize', title: 'JavaScript onresize event' },
        ]
      },
      {
        id: 'js-oops',
        title: '11. JavaScript OOPs',
        topics: [
          { id: 'js-oops-class', title: 'JS OOPS Class' },
          { id: 'js-object', title: 'JS Object' },
          { id: 'js-prototype', title: 'JS Prototype' },
          { id: 'js-constructor-method', title: 'JS constructor Method' },
          { id: 'js-static-method', title: 'JS static Method' },
          { id: 'js-encapsulation', title: 'JavaScript Encapsulation' },
          { id: 'js-inheritance', title: 'JS Inheritance' },
          { id: 'js-polymorphism', title: 'JS Polymorphism' },
          { id: 'js-abstraction', title: 'JS Abstraction' },
          { id: 'js-oops-classes', title: 'JavaScript Oops Classes' },
          { id: 'js-interview-questions', title: '300+ JavaScript Interview Questions' },
        ]
      },
      {
        id: 'javascript-mastery-quizzes',
        title: 'Quizzes & Assessments',
        topics: [
          { id: 'javascript-mastery-quiz-beginner', title: 'Beginner Quiz (50 Questions)' },
          { id: 'javascript-mastery-quiz-intermediate', title: 'Intermediate Quiz (50 Questions)' },
          { id: 'javascript-mastery-quiz-advanced', title: 'Advanced Quiz (50 Questions)' }
        ]
      }
    ]
  },
  {
    id: 'nodejs-mastery',
    title: 'Node.js + Express.js',
    icon: 'Terminal',
    sections: [
      {
        id: 'node-basics',
        title: '1. Node.js Basics',
        topics: [
          { id: 'node-tutorial', title: 'Node.js Tutorial' },
          { id: 'node-install-win', title: 'Install Node.js Windows' },
          { id: 'node-install-linux', title: 'Install Node.js Linux' },
          { id: 'node-first-example', title: 'Node.js First Example' },
          { id: 'node-console', title: 'Node.js Console' },
          { id: 'node-repl', title: 'Node.js REPL' },
          { id: 'node-npm', title: 'Node.js NPM' },
          { id: 'node-cl-options', title: 'Node.js CL Options' },
          { id: 'node-globals', title: 'Node.js Globals' }
        ]
      },
      {
        id: 'node-core-modules-1',
        title: '2. Node.js Core Modules (Part 1)',
        topics: [
          { id: 'node-os', title: 'Node.js OS' },
          { id: 'node-timer', title: 'Node.js Timer' },
          { id: 'node-errors', title: 'Node.js Errors' },
          { id: 'node-dns', title: 'Node.js DNS' },
          { id: 'node-net', title: 'Node.js Net' },
          { id: 'node-crypto', title: 'Node.js Crypto' },
          { id: 'node-tls-ssl', title: 'Node.js TLS/SSL' },
          { id: 'node-debugger', title: 'Node.js Debugger' },
          { id: 'node-process', title: 'Node.js Process' },
          { id: 'node-child-process', title: 'Node.js Child Process' },
        ]
      },
      {
        id: 'node-core-modules-2',
        title: '3. Node.js Core Modules (Part 2)',
        topics: [
          { id: 'node-buffers', title: 'Node.js Buffers' },
          { id: 'node-streams', title: 'Node.js Streams' },
          { id: 'node-fs', title: 'Node.js File System' },
          { id: 'node-path', title: 'Node.js Path' },
          { id: 'node-stringdecoder', title: 'Node.js StringDecoder' },
          { id: 'node-querystring', title: 'Node.js Query String' },
          { id: 'node-zlib', title: 'Node.js ZLIB' },
          { id: 'node-assertion', title: 'Node.js Assertion' },
          { id: 'node-v8', title: 'Node.js V8' },
        ]
      },
      {
        id: 'node-advanced',
        title: '4. Node.js Advanced Concepts',
        topics: [
          { id: 'node-callbacks', title: 'Node.js Callbacks' },
          { id: 'node-events', title: 'Node.js Events' },
          { id: 'node-punycode', title: 'Node.js Punycode' },
          { id: 'node-tty', title: 'Node.js TTY' },
          { id: 'node-web-modules', title: 'Node.js Web Modules' },
        ]
      },
      {
        id: 'node-mysql',
        title: '5. Node.js MySQL',
        topics: [
          { id: 'node-mysql-conn', title: 'MySQL Create Connection' },
          { id: 'node-mysql-db', title: 'MySQL Create Database' },
          { id: 'node-mysql-table', title: 'MySQL Create Table' },
          { id: 'node-mysql-insert', title: 'MySQL Insert Record' },
          { id: 'node-mysql-delete', title: 'MySQL Delete Record' },
          { id: 'node-mysql-select', title: 'MySQL Select Record' },
          { id: 'node-mysql-unique', title: 'MySQL Select Unique' },
          { id: 'node-mysql-drop', title: 'MySQL Drop Table' },
        ]
      },
      {
        id: 'node-mongodb',
        title: '6. Node.js MongoDB',
        topics: [
          { id: 'node-mongo-conn', title: 'Create Connection' },
          { id: 'node-mongo-db', title: 'Create Database' },
          { id: 'node-mongo-coll', title: 'Create Collection' },
          { id: 'node-mongo-insert', title: 'MongoDB Insert' },
          { id: 'node-mongo-select', title: 'MongoDB Select' },
          { id: 'node-mongo-query', title: 'MongoDB Query' },
          { id: 'node-mongo-sort', title: 'MongoDB Sorting' },
          { id: 'node-mongo-remove', title: 'MongoDB Remove' },
        ]
      },
      {
        id: 'node-differences',
        title: '7. Node.js Differences',
        topics: [
          { id: 'node-vs-angular', title: 'Node.js vs AngularJS' },
          { id: 'node-vs-python', title: 'Node.js vs Python' },
          { id: 'node-vs-php', title: 'Node.js vs PHP' },
          { id: 'node-vs-java', title: 'Node.js vs Java' },
        ]
      },
      {
        id: 'express-js',
        title: '8. Node.js Express',
        topics: [
          { id: 'express-install', title: 'Install Express.js' },
          { id: 'express-req', title: 'Express.js Request' },
          { id: 'express-res', title: 'Express.js Response' },
          { id: 'express-get', title: 'Express.js Get' },
          { id: 'express-post', title: 'Express.js Post' },
          { id: 'express-routing', title: 'Express.js Routing' },
          { id: 'express-cookies', title: 'Express.js Cookies' },
          { id: 'express-fileupload', title: 'Express.js File Upload' },
          { id: 'express-middleware', title: 'Express.js Middleware' },
          { id: 'express-scaffolding', title: 'Express.js Scaffolding' },
          { id: 'express-template', title: 'Express.js Template' },
        ]
      },
      {
        id: 'node-interview',
        title: '9. Interview Questions',
        topics: [
          { id: 'node-interview-qs', title: '300+ Node.js Interview Questions' },
          { id: 'express-interview-qs', title: '300+ ExpressJs Interview Questions' },
          { id: 'mongo-interview-qs', title: '300+ MongoDB Interview Questions' },
        ]
      },
      {
        id: 'nodejs-mastery-quizzes',
        title: 'Quizzes & Assessments',
        topics: [
          { id: 'nodejs-mastery-quiz-beginner', title: 'Beginner Quiz (50 Questions)' },
          { id: 'nodejs-mastery-quiz-intermediate', title: 'Intermediate Quiz (50 Questions)' },
          { id: 'nodejs-mastery-quiz-advanced', title: 'Advanced Quiz (50 Questions)' }
        ]
      }
    ]
  },
  {
    id: 'postgres-sql-mastery',
    title: 'PostgreSQL + MySQL (Advanced)',
    icon: 'Database',
    sections: [
      {
        id: 'pg-basics',
        title: '1. PostgreSQL Basics',
        topics: [
          { id: 'pg-overview', title: 'PostgreSQL - Overview' },
          { id: 'pg-env', title: 'PostgreSQL - Environment Setup' },
          { id: 'pg-syntax', title: 'PostgreSQL - Syntax' },
          { id: 'pg-datatypes', title: 'PostgreSQL - Data Types' },
          { id: 'pg-operators', title: 'PostgreSQL - Operators' },
          { id: 'pg-expressions', title: 'PostgreSQL - Expressions' },
          { id: 'pg-create-db', title: 'PostgreSQL - Create Database' },
          { id: 'pg-alter-db', title: 'PostgreSQL - ALTER DATABASE' },
          { id: 'pg-drop-db', title: 'PostgreSQL - Drop Database' },
          { id: 'pg-select-db', title: 'PostgreSQL - Select Database' },
          { id: 'pg-show-db', title: 'PostgreSQL - Show Database' }
        ]
      },
      {
        id: 'pg-queries',
        title: '2. PostgreSQL Query Operations',
        topics: [
          { id: 'pg-select', title: 'PostgreSQL - SELECT' },
          { id: 'pg-create', title: 'PostgreSQL - CREATE' },
          { id: 'pg-insert', title: 'PostgreSQL - INSERT' },
          { id: 'pg-update', title: 'PostgreSQL - UPDATE' },
          { id: 'pg-delete', title: 'PostgreSQL - DELETE' },
          { id: 'pg-alter-table', title: 'PostgreSQL - ALTER TABLE Command' },
          { id: 'pg-where', title: 'PostgreSQL - WHERE Clause' },
          { id: 'pg-orderby', title: 'PostgreSQL - ORDER BY Clause' },
          { id: 'pg-groupby', title: 'PostgreSQL - GROUP BY' },
          { id: 'pg-having', title: 'PostgreSQL - HAVING Clause' },
          { id: 'pg-distinct', title: 'PostgreSQL - DISTINCT Keyword' },
          { id: 'pg-limit', title: 'PostgreSQL - LIMIT Clause' },
          { id: 'pg-like', title: 'PostgreSQL - LIKE Clause' },
          { id: 'pg-with', title: 'PostgreSQL - WITH Clause' },
          { id: 'pg-and-or', title: 'PostgreSQL - AND & OR Clauses' },
          { id: 'pg-drop-table', title: 'PostgreSQL - DROP TABLE' },
          { id: 'pg-upsert', title: 'PostgreSQL - Upsert' },
          { id: 'pg-truncate', title: 'TRUNCATE TABLE Command' },
        ]
      },
      {
        id: 'pg-advanced',
        title: '3. PostgreSQL Advanced',
        topics: [
          { id: 'pg-schemas', title: 'PostgreSQL Schemas & Joins' },
          { id: 'pg-constraints', title: 'PostgreSQL - Constraints' },
          { id: 'pg-transactions', title: 'PostgreSQL - Transactions (Commit, Rollback)' },
          { id: 'pg-views', title: 'PostgreSQL - Views' },
          { id: 'pg-functions', title: 'PostgreSQL - Functions (MAX, MIN, SUM, COUNT)' },
          { id: 'pg-set-operators', title: 'PostgreSQL - UNION, EXCEPT, ANY, ALL, EXISTS' },
          { id: 'pg-triggers', title: 'PostgreSQL - Triggers & Indexes' },
          { id: 'pg-locks', title: 'PostgreSQL - Locks & Sub Queries' },
          { id: 'pg-privileges', title: 'PostgreSQL - Privileges & Auto Increment' },
          { id: 'pg-datetime', title: 'PostgreSQL - Date/Time Functions & Operators' },
        ]
      },
      {
        id: 'mysql-basics',
        title: '4. MySQL Basics & Tables',
        topics: [
          { id: 'mysql-tutorial', title: 'MySQL Tutorial, History & Features' },
          { id: 'mysql-datatypes', title: 'MySQL Data Types & Install' },
          { id: 'mysql-db-ops', title: 'Create, Select, Drop Database' },
          { id: 'mysql-table-ops', title: 'CREATE, ALTER, TRUNCATE, DROP Table' },
          { id: 'mysql-views', title: 'MySQL Views' },
        ]
      },
      {
        id: 'mysql-queries',
        title: '5. MySQL Queries & Clauses',
        topics: [
          { id: 'mysql-crud', title: 'INSERT, UPDATE, DELETE, SELECT Record' },
          { id: 'mysql-where-distinct', title: 'MySQL WHERE & DISTINCT' },
          { id: 'mysql-order-group', title: 'MySQL ORDER BY, GROUP BY, HAVING' },
          { id: 'mysql-conditions', title: 'MySQL AND, OR, LIKE, IN, NOT, BETWEEN' },
          { id: 'mysql-nulls', title: 'MySQL IS NULL, IS NOT NULL' },
          { id: 'mysql-joins', title: 'MySQL JOIN' },
          { id: 'mysql-agg-funcs', title: 'Aggregate Functions (count, sum, avg, min, max)' },
        ]
      },
      {
        id: 'mysql-date-time',
        title: '6. MySQL Date/Time Functions',
        topics: [
          { id: 'mysql-date-1', title: 'DATE(), ADDDATE(), CURDATE(), CURRENT_DATE()' },
          { id: 'mysql-date-2', title: 'DATE_ADD(), DATE_FORMAT(), DATEDIFF()' },
          { id: 'mysql-date-3', title: 'DAY(), DAYNAME(), DAYOFMONTH(), DAYOFWEEK(), DAYOFYEAR()' },
          { id: 'mysql-date-4', title: 'From_days(), Hour(), ADDTIME(), CURRENT_TIME()' },
          { id: 'mysql-date-5', title: 'CURRENT_TIMESTAMP(), CURTIME(), last_day()' },
          { id: 'mysql-date-6', title: 'localtime(), localtimestamp(), makedate(), maketime()' },
          { id: 'mysql-date-7', title: 'microsecond(), minute(), month(), monthname()' },
          { id: 'mysql-date-8', title: 'now(), period_add(), period_diff(), quarter()' },
          { id: 'mysql-date-9', title: 'sec_to_time(), second(), str_to_date()' },
          { id: 'mysql-date-10', title: 'Subdate(), Subtime(), Sysdate(), time()' },
          { id: 'mysql-date-11', title: 'time_format(), time_to_sec(), timediff(), timestamp()' },
          { id: 'mysql-date-12', title: 'to_day(), weekday(), week(), weekofyear()' },
        ]
      },
      {
        id: 'mysql-math',
        title: '7. MySQL Math Functions',
        topics: [
          { id: 'mysql-math-1', title: 'ABS(), ACOS(), ASIN(), ATAN(), ATAN2()' },
          { id: 'mysql-math-2', title: 'AVG(), CEIL(), CEILING(), COS(), COT()' },
          { id: 'mysql-math-3', title: 'COUNT(), DEGREES(), DIV(), EXP(), FLOOR()' },
          { id: 'mysql-math-4', title: 'GREATEST(), LEAST(), LN(), LOG(), LOG10(), LOG2()' },
          { id: 'mysql-math-5', title: 'MAX(), MIN(), MOD(), PI(), POW(), POWER()' },
          { id: 'mysql-math-6', title: 'RADIANS(), RAND(), ROUND(), SIGN(), SIN(), SQRT()' },
          { id: 'mysql-math-7', title: 'SUM(), TAN(), TRUNCATE()' },
        ]
      },
      {
        id: 'mysql-string',
        title: '8. MySQL String Functions',
        topics: [
          { id: 'mysql-str-1', title: 'CONCAT(), CONCAT_WS(), CHARACTER_LENGTH()' },
          { id: 'mysql-str-2', title: 'ELT(), EXPORT_SET(), FIELD(), FIND_IN_SET()' },
          { id: 'mysql-str-3', title: 'FORMAT(), FROM_BASE64(), HEX(), INSERT(), INSTR()' },
          { id: 'mysql-str-4', title: 'LCASE(), LOWER(), LEFT(), LENGTH(), like()' },
          { id: 'mysql-str-5', title: 'LOAD_FILE(), LOCATE(), LPAD(), LTRIM()' },
          { id: 'mysql-str-6', title: 'MAKE_SET(), MID(), OCT(), OCTET_LENGTH(), ORD()' },
          { id: 'mysql-str-7', title: 'POSITION(), QUOTE(), REPEAT(), REPLACE(), REVERSE()' },
          { id: 'mysql-str-8', title: 'RIGHT(), RPAD(), RTRIM(), SOUNDEX(), SPACE()' },
          { id: 'mysql-str-9', title: 'STRCMP(), SUBSTR(), SUBSTRING(), SUBSTRING_INDEX()' },
          { id: 'mysql-str-10', title: 'Trim(), UCASE(), UPPER(), UNHEX()' },
        ]
      },
      {
        id: 'db-interview',
        title: '9. Differences & Interview Questions',
        topics: [
          { id: 'diff-mariadb-mysql', title: 'MariaDB vs MySQL' },
          { id: 'diff-pg-mysql', title: 'PostgreSQL vs MySQL' },
          { id: 'pg-interview', title: '300+ PostgreSQL Interview Questions' },
          { id: 'mysql-interview', title: '300+ MySQL Interview Questions' },
          { id: 'sql-interview', title: 'SQL & PL/SQL Interview Questions' },
        ]
      },
      {
        id: 'postgres-sql-mastery-quizzes',
        title: 'Quizzes & Assessments',
        topics: [
          { id: 'postgres-sql-mastery-quiz-beginner', title: 'Beginner Quiz (50 Questions)' },
          { id: 'postgres-sql-mastery-quiz-intermediate', title: 'Intermediate Quiz (50 Questions)' },
          { id: 'postgres-sql-mastery-quiz-advanced', title: 'Advanced Quiz (50 Questions)' }
        ]
      }
    ]
  },
  {
    id: 'rest-api-design',
    title: 'REST API Design (Best Practices)',
    icon: 'Network',
    sections: [
      {
        id: 'rest-basics',
        title: '1. REST API Fundamentals',
        topics: [
          { id: 'rest-intro', title: 'What is REST? (Representational State Transfer)' },
          { id: 'rest-principles', title: '6 Guiding Principles of REST' },
          { id: 'rest-vs-soap', title: 'REST vs SOAP vs GraphQL vs gRPC' },
          { id: 'rest-resources', title: 'Resources and URIs Naming Conventions' },
          { id: 'rest-methods', title: 'HTTP Methods (GET, POST, PUT, PATCH, DELETE)' },
          { id: 'rest-status-codes', title: 'HTTP Status Codes (2xx, 3xx, 4xx, 5xx)' }
        ]
      },
      {
        id: 'rest-advanced-design',
        title: '2. Advanced API Design',
        topics: [
          { id: 'rest-versioning', title: 'API Versioning Strategies (URI, Header, Query)' },
          { id: 'rest-pagination', title: 'Pagination (Offset, Cursor-based)' },
          { id: 'rest-filtering', title: 'Filtering, Sorting, and Searching' },
          { id: 'rest-hateoas', title: 'HATEOAS (Hypermedia as the Engine of Application State)' },
          { id: 'rest-idempotency', title: 'Idempotency in REST APIs' },
          { id: 'rest-caching', title: 'Caching Strategies (ETag, Cache-Control)' },
        ]
      },
      {
        id: 'rest-security-perf',
        title: '3. Security & Performance',
        topics: [
          { id: 'rest-auth', title: 'Authentication & Authorization (OAuth 2.0, JWT)' },
          { id: 'rest-rate-limiting', title: 'Rate Limiting and Throttling' },
          { id: 'rest-cors', title: 'CORS (Cross-Origin Resource Sharing)' },
          { id: 'rest-payload', title: 'Payload Compression & Optimization' },
          { id: 'rest-error-handling', title: 'Standardized Error Handling (RFC 7807)' },
        ]
      },
      {
        id: 'rest-interview',
        title: '4. Interview Questions',
        topics: [
          { id: 'rest-interview-qs', title: '300+ REST API Interview Questions' }
        ]
      },
      {
        id: 'rest-api-design-quizzes',
        title: 'Quizzes & Assessments',
        topics: [
          { id: 'rest-api-design-quiz-beginner', title: 'Beginner Quiz (50 Questions)' },
          { id: 'rest-api-design-quiz-intermediate', title: 'Intermediate Quiz (50 Questions)' },
          { id: 'rest-api-design-quiz-advanced', title: 'Advanced Quiz (50 Questions)' }
        ]
      }
    ]
  },
  {
    id: 'docker-advanced',
    title: 'Docker (Advanced)',
    icon: 'Box',
    sections: [
      {
        id: 'docker-intro',
        title: '1. Docker Introduction',
        topics: [
          { id: 'docker-what-is', title: 'Docker Introduction' },
          { id: 'docker-install', title: 'Docker Installation on Ubuntu' },
          { id: 'docker-arch', title: 'Docker Architecture' }
        ]
      },
      {
        id: 'docker-commands',
        title: '2. Docker Commands',
        topics: [
          { id: 'docker-cli', title: 'Docker Commands' },
          { id: 'docker-run-inside', title: 'Running Commands Inside Docker Container' },
        ]
      },
      {
        id: 'docker-files-images',
        title: '3. Dockerfile and Images',
        topics: [
          { id: 'dockerfile-what-is', title: 'What is Dockerfile?' },
          { id: 'dockerfile-syntax', title: 'Syntax of Dockerfile' },
          { id: 'docker-image-what-is', title: 'What is Docker Image?' },
          { id: 'docker-optimize-image', title: 'How to optimize Docker Image?' },
          { id: 'docker-build-web', title: 'How to Build a Web Server Docker File?' },
        ]
      },
      {
        id: 'docker-hub',
        title: '4. Docker Hub',
        topics: [
          { id: 'docker-hub-what-is', title: 'What is Docker Hub?' },
          { id: 'docker-login-pull-push', title: 'Log in to Docker for Pulling and Pushing Images' },
          { id: 'docker-publish', title: 'Docker - Publishing Images to Docker Hub' },
        ]
      },
      {
        id: 'docker-compose',
        title: '5. Docker Compose',
        topics: [
          { id: 'docker-compose-intro', title: 'Introduction to Docker Compose' },
          { id: 'docker-compose-multi', title: 'Docker Compose Tool To Run Multi Container Applications' },
        ]
      },
      {
        id: 'docker-engine-storage',
        title: '6. Docker Engine and Storage',
        topics: [
          { id: 'docker-storage', title: 'Docker Storage' },
          { id: 'docker-data-storage', title: 'Docker Data Storage' },
          { id: 'docker-backup', title: 'Backup Docker Container' },
          { id: 'docker-manage-volumes', title: 'Manage Volumes using CLI' },
        ]
      },
      {
        id: 'docker-networking',
        title: '7. Docker Networking',
        topics: [
          { id: 'docker-network', title: 'Docker Networking' },
          { id: 'docker-ports', title: 'Docker Ports' },
          { id: 'docker-create-network', title: 'Creating a Network and connecting a Container' },
          { id: 'docker-connect-two', title: 'Connecting Two Docker Containers Over the Same Network' },
          { id: 'docker-bridge', title: 'Default Bridge Networking' },
          { id: 'docker-pihole', title: 'Create your own secure Home Network using Pi-hole and Docker' },
        ]
      },
      {
        id: 'docker-registry',
        title: '8. Docker Registry',
        topics: [
          { id: 'docker-registry-intro', title: 'Docker Registry' },
          { id: 'docker-public-repo', title: 'Public Repositories' },
          { id: 'docker-private-registry', title: 'Private Registries' },
          { id: 'docker-create-private', title: 'Creating a Private Repository and Push an Image' },
          { id: 'docker-host-public', title: 'Using Public Repositories To Host Docker Images' },
        ]
      },
      {
        id: 'docker-volumes',
        title: '9. Docker Volumes',
        topics: [
          { id: 'docker-volumes-what-is', title: 'What is Docker Volumes' },
          { id: 'docker-mount-volume', title: 'Mounting a Volume Inside Docker Container' },
          { id: 'docker-share-data', title: 'Sharing data between containers using Docker volumes' },
          { id: 'docker-bind-mount', title: 'How To Use Bind Mount In Docker?' },
          { id: 'docker-vol-vs-bind', title: 'Difference between Volumes and bind Mounts' },
        ]
      },
      {
        id: 'docker-advanced-topics',
        title: '10. Advanced Docker & Kubernetes',
        topics: [
          { id: 'docker-swarm', title: 'Docker Swarm' },
          { id: 'docker-security', title: 'Docker - Security Best Practices' },
          { id: 'docker-security-tools', title: 'How To Use Docker Security Tools To Secure Docker Container Images' },
          { id: 'docker-vs-k8s', title: 'Docker Vs Kubernetes' },
        ]
      },
      {
        id: 'docker-interview',
        title: '11. Interview Questions',
        topics: [
          { id: 'docker-interview-qs', title: '300+ Docker Interview Questions' }
        ]
      },
      {
        id: 'docker-advanced-quizzes',
        title: 'Quizzes & Assessments',
        topics: [
          { id: 'docker-advanced-quiz-beginner', title: 'Beginner Quiz (50 Questions)' },
          { id: 'docker-advanced-quiz-intermediate', title: 'Intermediate Quiz (50 Questions)' },
          { id: 'docker-advanced-quiz-advanced', title: 'Advanced Quiz (50 Questions)' }
        ]
      }
    ]
  },
  {
    id: 'aws-advanced',
    title: 'AWS (Advanced)',
    icon: 'Cloud',
    sections: [
      {
        id: 'aws-getting-started',
        title: '1. Getting Started with AWS',
        topics: [
          { id: 'aws-intro', title: 'Introduction to AWS' },
          { id: 'aws-free-tier', title: 'Setup Free Tier Account' },
          { id: 'aws-business', title: 'Setup AWS Business Account' },
          { id: 'aws-console', title: 'AWS Management Console' },
          { id: 'aws-cli', title: 'AWS Command Line Interface (CLI)' }
        ]
      },
      {
        id: 'aws-iam',
        title: '2. Securing Your Account with IAM',
        topics: [
          { id: 'aws-iam-intro', title: 'AWS IAM' },
          { id: 'aws-saml', title: 'AWS SAML' },
          { id: 'aws-iam-ec2', title: 'Creating IAM roles for EC2' },
          { id: 'aws-iam-deny', title: 'Denying Access using IAM policy for EC2 and EBS Instance' },
          { id: 'aws-mfa', title: 'MFA for more security' },
        ]
      },
      {
        id: 'aws-compute',
        title: '3. Computing in AWS (EC2, EBS, AMI, Lambda)',
        topics: [
          { id: 'aws-ec2-intro', title: 'What is EC2?' },
          { id: 'aws-ec2-manage', title: 'How to create and manage an EC2 Instance' },
          { id: 'aws-ec2-types', title: 'Types of EC2 & Price Model' },
          { id: 'aws-ec2-spot', title: 'Introduction to EC2 Spot Instances' },
          { id: 'aws-ec2-connect', title: 'How to connect to EC2 instances (Linux/Windows)' },
          { id: 'aws-ebs-intro', title: 'What is EBS (Elastic Bean Stalk)' },
          { id: 'aws-ebs-attach', title: 'How to Attach EBS Volume in EC2' },
          { id: 'aws-ebs-replace', title: 'Replacing Unhealthy EC2 Instances in EBS' },
          { id: 'aws-ebs-launch', title: 'Launching an Application on AWS Beanstalk' },
          { id: 'aws-ebs-sg', title: 'Add Security Group in EBS' },
          { id: 'aws-ami', title: 'Definition & Creation of AMI' },
          { id: 'aws-lambda', title: 'AWS Lambda & Create Function' },
          { id: 'aws-lambda-dynamo', title: 'Insert data in DynamoDB using Lambda' },
          { id: 'aws-ecs-eks-ecr', title: 'What is ECS, EKS, ECR' },
          { id: 'aws-ebs-vs-efs', title: 'Difference between EBS and EFS' },
        ]
      },
      {
        id: 'aws-storage',
        title: '4. AWS Storage Services',
        topics: [
          { id: 'aws-s3-intro', title: 'What is AWS S3? & Creation' },
          { id: 'aws-s3-types', title: 'AWS S3 Storage types/classes' },
          { id: 'aws-s3-lifecycle', title: 'AWS S3 Lifecycle Management' },
          { id: 'aws-ebs-storage', title: 'Elastic Block Store (EBS) & Snapshot creation' },
          { id: 'aws-efs-storage', title: 'Elastic File System (EFS)' },
          { id: 'aws-storage-diff', title: 'EBS vs EFS | S3 vs EBS' },
          { id: 'aws-glacier', title: 'AWS Glacier' },
          { id: 'aws-backup', title: 'How to setup AWS Backup & Disaster Recovery Strategies' },
        ]
      },
      {
        id: 'aws-data-delivery',
        title: '5. Data Delivery, Migration and Hybrid',
        topics: [
          { id: 'aws-cloudfront', title: 'Cloud Front CDN & Creating it' },
          { id: 'aws-snowball', title: 'AWS Snowball' },
          { id: 'aws-storage-gateway', title: 'Storage Gateway' },
        ]
      },
      {
        id: 'aws-app-services',
        title: '6. AWS Application Services',
        topics: [
          { id: 'aws-sqs', title: 'AWS SQS (Simple Queue Service)' },
          { id: 'aws-sns', title: 'AWS SNS (Simple Notification Service) & Installation' },
          { id: 'aws-swf', title: 'AWS SWF (Simple Workflow Service)' },
          { id: 'aws-transcoder', title: 'Elastic Transcoder' },
          { id: 'aws-api-gateway', title: 'API Gateway' },
          { id: 'aws-kinesis', title: 'AWS Kinesis' },
        ]
      },
      {
        id: 'aws-databases',
        title: '7. AWS Database Services',
        topics: [
          { id: 'aws-db-diff', title: 'Difference between Relational and Non-Relational Database' },
          { id: 'aws-dynamodb', title: 'AWS DynamoDB & Working with Tables' },
          { id: 'aws-nosql-workbench', title: 'Introduction to NoSQL Workbench' },
          { id: 'aws-db-backup', title: 'Backing up Data' },
          { id: 'aws-aurora', title: 'What is Aurora' },
          { id: 'aws-rds', title: 'AWS RDS Overview & Creating Instance' },
          { id: 'aws-rds-vs-aurora', title: 'AWS RDS vs Aurora' },
          { id: 'aws-redshift', title: 'Amazon Redshift' },
          { id: 'aws-elasticache', title: 'ElasticCache' },
        ]
      },
      {
        id: 'aws-vpc-networking',
        title: '8. AWS VPC & Networking',
        topics: [
          { id: 'aws-vpc-intro', title: 'AWS VPC & Creating custom VPC' },
          { id: 'aws-vpc-components', title: 'VPC Networking Components & Security' },
          { id: 'aws-vpc-peering', title: 'VPC Peering' },
          { id: 'aws-bastion', title: 'AWS Bastion Host & Connecting EC2' },
          { id: 'aws-autoscaling', title: 'AutoScaling in EC2 & Create Group' },
          { id: 'aws-nacl-vs-sg', title: 'NACL vs Security Group' },
          { id: 'aws-lightsail', title: 'AWS Lightsail' },
          { id: 'aws-cloudformation', title: 'AWS CloudFormation' },
          { id: 'aws-dns-route53', title: 'DNS & AWS Route 53' },
          { id: 'aws-loadbalancer', title: 'Definition & Creation of Load Balancer' },
        ]
      },
      {
        id: 'aws-billing-ml-monitoring',
        title: '9. Billing, ML & Monitoring',
        topics: [
          { id: 'aws-cost-explorer', title: 'Introduction to Cost Explorer and Cost Management' },
          { id: 'aws-budget', title: 'AWS Budget Setup & Cost Usage Report' },
          { id: 'aws-sagemaker', title: 'AWS Sagemaker & Custom UI' },
          { id: 'aws-iot', title: 'IoT Products' },
          { id: 'aws-cloudwatch', title: 'AWS CloudWatch & Synthetics' },
          { id: 'aws-cloudwatch-vs-cloudtrail', title: 'Difference between CloudWatch and CloudTrail' },
          { id: 'aws-bash', title: 'Bash Scripting' },
        ]
      },
      {
        id: 'aws-interview',
        title: '10. Interview Questions',
        topics: [
          { id: 'aws-interview-qs', title: '300+ AWS Interview Questions' }
        ]
      },
      {
        id: 'aws-advanced-quizzes',
        title: 'Quizzes & Assessments',
        topics: [
          { id: 'aws-advanced-quiz-beginner', title: 'Beginner Quiz (50 Questions)' },
          { id: 'aws-advanced-quiz-intermediate', title: 'Intermediate Quiz (50 Questions)' },
          { id: 'aws-advanced-quiz-advanced', title: 'Advanced Quiz (50 Questions)' }
        ]
      }
    ]
  },
  {
    id: 'system-design',
    title: 'System Design (Senior Roles)',
    icon: 'Briefcase',
    sections: [
      {
        id: 'sd-basics',
        title: '1. Basics & High Level Design',
        topics: [
          { id: 'sd-intro', title: 'System Design Introduction - HLD & LLD' },
          { id: 'sd-reqs', title: 'Functional and Non Functional Requirements' },
          { id: 'sd-hld-intro', title: 'Introduction to High Level Design' },
          { id: 'sd-hld-diagram', title: 'High Level Design Diagram' },
          { id: 'sd-monolithic', title: 'Monolithic Architecture' },
          { id: 'sd-microservices', title: 'Microservices' },
          { id: 'sd-mono-vs-micro', title: 'Monolithic Vs Microservices Architecture' },
          { id: 'sd-serverless', title: 'Serverless Architecture' },
          { id: 'sd-stateful-stateless', title: 'Stateless and Stateful Systems' },
          { id: 'sd-stateful-vs-stateless', title: 'Stateful Vs Stateless Architecture' },
          { id: 'sd-pubsub', title: 'Pub/Sub Architecture' }
        ]
      },
      {
        id: 'sd-scalability',
        title: '2. Scalability',
        topics: [
          { id: 'sd-scalability-intro', title: 'Scalability in System Design' },
          { id: 'sd-scaling-types', title: 'Horizontal and Vertical Scaling' },
          { id: 'sd-scaling-approach', title: 'Choosing the Right Scalability Approach' },
          { id: 'sd-highly-scalable', title: 'Designing Highly Scalable Systems' },
          { id: 'sd-scaling-bottlenecks', title: 'Primary Scalability Bottlenecks in System Design' },
        ]
      },
      {
        id: 'sd-databases',
        title: '3. Databases in Designing Systems',
        topics: [
          { id: 'sd-db-design', title: 'Designing the Database' },
          { id: 'sd-db-types', title: 'Types of Database' },
          { id: 'sd-sql-nosql', title: 'Choosing a Database - SQL or NoSQL' },
          { id: 'sd-storage-systems', title: 'File and Database Storage Systems' },
          { id: 'sd-db-replication', title: 'Database Replication in System Design' },
          { id: 'sd-replication-types', title: 'Types of Database Replication' },
          { id: 'sd-sharding', title: 'Database Sharding' },
          { id: 'sd-partitioning', title: 'Data Partitioning' },
          { id: 'sd-block-object-file', title: 'Block, Object, and File Storage' },
          { id: 'sd-normalization', title: 'Normalization Process in DBMS' },
          { id: 'sd-query-opt', title: 'SQL Query Optimization' },
          { id: 'sd-denormalization', title: 'Denormalization in Databases' },
          { id: 'sd-redis', title: 'Intro to Redis' },
        ]
      },
      {
        id: 'sd-cap-reliability',
        title: '4. Consistency, Availability & Reliability',
        topics: [
          { id: 'sd-availability', title: 'Availability in System Design' },
          { id: 'sd-high-availability', title: 'Achieving High Availability' },
          { id: 'sd-consistency', title: 'Consistency in System Design' },
          { id: 'sd-consistency-pattern', title: 'Consistency pattern' },
          { id: 'sd-cap-theorem', title: 'CAP Theorem' },
          { id: 'sd-reliability', title: 'Reliability in System Design' },
          { id: 'sd-fault-tolerance', title: 'Fault Tolerance in System Design' },
          { id: 'sd-maintainability', title: 'Maintainability' },
        ]
      },
      {
        id: 'sd-load-balancing',
        title: '5. Load Balancing',
        topics: [
          { id: 'sd-lb-intro', title: 'Load Balancer' },
          { id: 'sd-lb-types', title: 'Types of Load Balancer' },
          { id: 'sd-lb-algorithms', title: 'Load Balancing Algorithms' },
          { id: 'sd-concurrency', title: 'Concurrency and Parallelism' },
          { id: 'sd-stateless-stateful-lb', title: 'Stateless Vs Stateful Load Balancing' },
          { id: 'sd-lb-vs-failover', title: 'Load Balancing Vs Failover' },
          { id: 'sd-consistent-hashing', title: 'Consistent Hashing' },
        ]
      },
      {
        id: 'sd-caching',
        title: '6. Latency, Throughput and Caching',
        topics: [
          { id: 'sd-latency-throughput', title: 'Latency and Throughput' },
          { id: 'sd-caching-intro', title: 'Caching in System Design' },
          { id: 'sd-distributed-cache', title: 'Distributed Cache' },
          { id: 'sd-design-dist-cache', title: 'Design Distributed Cache' },
          { id: 'sd-edge-caching', title: 'Edge Caching' },
          { id: 'sd-cdn-vs-edge', title: 'CDN Vs Edge Server' },
          { id: 'sd-cache-eviction', title: 'Cache Eviction Policies' },
          { id: 'sd-cold-warm-cache', title: 'Cold and Warm Cache in System Design' },
        ]
      },
      {
        id: 'sd-api-gateway-mq',
        title: '7. API Gateway, Message Queues & Rate Limiting',
        topics: [
          { id: 'sd-api-gateway', title: 'API Gateway' },
          { id: 'sd-message-queues', title: 'Message Queues' },
          { id: 'sd-rate-limiting', title: 'Rate Limiting' },
          { id: 'sd-rate-limiting-algo', title: 'Rate Limiting Algorithm' },
        ]
      },
      {
        id: 'sd-networking',
        title: '8. Protocols, CDN, Proxies & WebSockets',
        topics: [
          { id: 'sd-protocols', title: 'Communication Protocols' },
          { id: 'sd-dns', title: 'Domain Name System' },
          { id: 'sd-dns-caching', title: 'DNS Caching' },
          { id: 'sd-dns-flush', title: 'Flushing(Reset) of DNS Cache' },
          { id: 'sd-ttl', title: 'Time to Live(TTL)' },
          { id: 'sd-cdn', title: 'Content Delivery Network(CDN)' },
          { id: 'sd-proxies', title: 'Proxies in System Design' },
          { id: 'sd-fwd-rev-proxy', title: 'Forward Proxy vs Reverse Proxy' },
          { id: 'sd-web-app-server', title: 'Web and Application Server' },
          { id: 'sd-polling', title: 'Long Polling and Short Polling' },
          { id: 'sd-websockets', title: 'Websockets' },
        ]
      },
      {
        id: 'sd-event-driven',
        title: '9. Event-Driven Architecture',
        topics: [
          { id: 'sd-eda-intro', title: 'Introduction to Event-Driven Architecture' },
          { id: 'sd-event-sourcing', title: 'Event Sourcing Pattern' },
          { id: 'sd-sourcing-vs-streaming', title: 'Event Sourcing Vs Event Streaming' },
          { id: 'sd-eda-apis', title: 'Event-Driven APIs in Microservice Architectures' },
          { id: 'sd-eda-error-handling', title: 'Error Handling in Event-Driven Architecture' },
          { id: 'sd-eda-restore-state', title: 'Restore State in an Event-Based Architecture' },
          { id: 'sd-eda-cloud-native', title: 'Event-Driven Architecture Patterns in Cloud Native' },
          { id: 'sd-req-vs-event', title: 'Request-driven Vs Event-driven Microservices' },
          { id: 'sd-eda-vs-microservices', title: 'Event-Driven Architecture Vs Microservices' },
          { id: 'sd-msg-vs-eda', title: 'Message-Driven Architecture Vs Event-Driven Architecture' },
        ]
      },
      {
        id: 'sd-testing-security',
        title: '10. Testing, Security & Distributed Systems',
        topics: [
          { id: 'sd-testing', title: 'Unit, Integration, Load, Stress Testing & CI/CD' },
          { id: 'sd-security', title: 'Security Measures, Auth, SSL/TLS, SSDLC' },
          { id: 'sd-disaster-recovery', title: 'Data Backup and Disaster Recovery' },
          { id: 'sd-dist-sys-intro', title: 'Introduction to Distributed System Design' },
          { id: 'sd-consensus', title: 'Consensus Algorithms in Distributed System' },
          { id: 'sd-dist-tracing', title: 'Distributed Tracing' },
          { id: 'sd-secure-comm', title: 'Secure Communication in Distributed System' },
          { id: 'sd-dist-issues', title: 'Design Issues of Distributed System' },
          { id: 'sd-cost-perf', title: 'Software Cost Estimation & Performance Optimization' },
        ]
      },
      {
        id: 'sd-lld',
        title: '11. Low Level Design (LLD) & Principles',
        topics: [
          { id: 'sd-oop', title: 'Object-Oriented Programming(OOP) Concepts' },
          { id: 'sd-modularity', title: 'Modularity and Interfaces' },
          { id: 'sd-lld-intro', title: 'Low Level Design or LLD' },
          { id: 'sd-hld-vs-lld', title: 'Difference between HLD and LLD' },
          { id: 'sd-solid', title: 'SOLID Principles' },
          { id: 'sd-dry-kiss-yagni', title: 'DRY, KISS, YAGNI Principles' },
          { id: 'sd-uml', title: 'Unified Modeling Language (UML)' },
          { id: 'sd-design-patterns', title: 'Design Patterns' },
        ]
      },
      {
        id: 'sd-real-world',
        title: '12. Real-World Design & Interviews',
        topics: [
          { id: 'sd-url-shortener', title: 'URL Shortening Service' },
          { id: 'sd-dropbox', title: 'Design Dropbox' },
          { id: 'sd-twitter', title: 'Design Twitter' },
          { id: 'sd-netflix', title: 'System Design Netflix' },
          { id: 'sd-uber', title: 'System Design of Uber App' },
          { id: 'sd-bookmyshow', title: 'Design BookMyShow' },
          { id: 'sd-fb-messenger', title: 'Designing Facebook Messenger' },
          { id: 'sd-whatsapp', title: 'Designing Whatsapp Messenger' },
          { id: 'sd-instagram', title: 'Designing Instagram' },
          { id: 'sd-airline', title: 'System Designing of Airline Management System' },
          { id: 'sd-interview-prep', title: 'Cracking System Design Round in Interviews' },
          { id: 'sd-lld-tips', title: 'Tips to Crack Low-Level System Design Interviews' },
          { id: 'sd-interview-qs', title: '300+ System Design Interview Questions' },
        ]
      },
      {
        id: 'system-design-quizzes',
        title: 'Quizzes & Assessments',
        topics: [
          { id: 'system-design-quiz-beginner', title: 'Beginner Quiz (50 Questions)' },
          { id: 'system-design-quiz-intermediate', title: 'Intermediate Quiz (50 Questions)' },
          { id: 'system-design-quiz-advanced', title: 'Advanced Quiz (50 Questions)' }
        ]
      }
    ]
  },
  {
    id: 'php-mastery',
    title: 'PHP Complete Syllabus',
    icon: 'Code2',
    sections: [
      {
        id: 'php-basics',
        title: '1. PHP Basics',
        topics: [
          { id: 'php-intro', title: 'PHP Introduction' },
          { id: 'php-install', title: 'PHP Installation' },
          { id: 'php-syntax', title: 'PHP Syntax' },
          { id: 'php-variables', title: 'PHP Variables' },
          { id: 'php-datatypes', title: 'PHP Data Types' },
          { id: 'php-strings', title: 'PHP Strings' },
          { id: 'php-operators', title: 'PHP Operators' }
        ]
      },
      {
        id: 'php-control',
        title: '2. PHP Control Statements',
        topics: [
          { id: 'php-if-else', title: 'PHP If-else' },
          { id: 'php-switch', title: 'PHP Switch' },
          { id: 'php-while', title: 'PHP While Loops' },
          { id: 'php-for', title: 'PHP For Loops' },
          { id: 'php-arrays', title: 'PHP Arrays' },
          { id: 'php-superglobals', title: 'PHP Superglobals' }
        ]
      },
      {
        id: 'php-forms-db',
        title: '3. PHP Forms & Database',
        topics: [
          { id: 'php-form-handling', title: 'PHP Form Handling' },
          { id: 'php-form-validation', title: 'PHP Form Validation' },
          { id: 'php-mysql-intro', title: 'PHP MySQL Database' },
          { id: 'php-mysql-connect', title: 'PHP Connect to MySQL' },
          { id: 'php-mysql-crud', title: 'PHP Insert/Select/Update/Delete' }
        ]
      },
      {
        id: 'php-advanced',
        title: '4. PHP Advanced',
        topics: [
          { id: 'php-oops', title: 'PHP OOPs Concepts' },
          { id: 'php-date', title: 'PHP Date and Time' },
          { id: 'php-file-handling', title: 'PHP File Handling' },
          { id: 'php-cookies', title: 'PHP Cookies & Sessions' },
          { id: 'php-interview', title: '300+ PHP Interview Questions' }
        ]
      },
      {
        id: 'php-quizzes',
        title: 'Quizzes & Assessments',
        topics: [
          { id: 'php-quiz-beginner', title: 'Beginner Quiz (50 Questions)' },
          { id: 'php-quiz-intermediate', title: 'Intermediate Quiz (50 Questions)' },
          { id: 'php-quiz-advanced', title: 'Advanced Quiz (50 Questions)' }
        ]
      }
    ]
  },
  {
    id: 'angular-mastery',
    title: 'Angular Syllabus',
    icon: 'LayoutTemplate',
    sections: [
      {
        id: 'ng-basics',
        title: '1. Angular Basics',
        topics: [
          { id: 'ng-intro', title: 'Angular Introduction' },
          { id: 'ng-setup', title: 'Angular Setup & CLI' },
          { id: 'ng-architecture', title: 'Angular Architecture' },
          { id: 'ng-components', title: 'Angular Components' },
          { id: 'ng-templates', title: 'Angular Templates' }
        ]
      },
      {
        id: 'ng-directives',
        title: '2. Directives & Routing',
        topics: [
          { id: 'ng-directives-intro', title: 'Angular Directives' },
          { id: 'ng-ngif', title: 'ngIf & ngFor' },
          { id: 'ng-routing', title: 'Angular Routing' },
          { id: 'ng-services', title: 'Angular Services & DI' }
        ]
      },
      {
        id: 'ng-advanced',
        title: '3. Forms & HTTP',
        topics: [
          { id: 'ng-forms', title: 'Angular Reactive Forms' },
          { id: 'ng-http', title: 'Angular HttpClient' },
          { id: 'ng-observables', title: 'Observables & RxJS' },
          { id: 'ng-interview', title: '300+ Angular Interview Questions' }
        ]
      },
      {
        id: 'ng-quizzes',
        title: 'Quizzes & Assessments',
        topics: [
          { id: 'ng-quiz-beginner', title: 'Beginner Quiz (50 Questions)' },
          { id: 'ng-quiz-intermediate', title: 'Intermediate Quiz (50 Questions)' },
          { id: 'ng-quiz-advanced', title: 'Advanced Quiz (50 Questions)' }
        ]
      }
    ]
  },
  {
    id: 'web-tech',
    title: 'Web Tech (HTML & CSS)',
    icon: 'Map',
    sections: [
      {
        id: 'html-core',
        title: '1. HTML Core',
        topics: [
          { id: 'html-intro', title: 'HTML Introduction' },
          { id: 'html-elements', title: 'HTML Elements & Tags' },
          { id: 'html-forms', title: 'HTML Forms & Inputs' },
          { id: 'html-html5', title: 'HTML5 Semantic Elements' }
        ]
      },
      {
        id: 'css-core',
        title: '2. CSS Core',
        topics: [
          { id: 'css-intro', title: 'CSS Introduction' },
          { id: 'css-selectors', title: 'CSS Selectors & Colors' },
          { id: 'css-box-model', title: 'CSS Box Model' },
          { id: 'css-display', title: 'CSS Display & Flexbox' },
          { id: 'css-grid', title: 'CSS Grid' }
        ]
      },
      {
        id: 'web-interview',
        title: '3. Interview Questions',
        topics: [
          { id: 'web-interview-qs', title: '300+ HTML/CSS Interview Questions' }
        ]
      },
      {
        id: 'web-quizzes',
        title: 'Quizzes & Assessments',
        topics: [
          { id: 'web-quiz-beginner', title: 'Beginner Quiz (50 Questions)' },
          { id: 'web-quiz-intermediate', title: 'Intermediate Quiz (50 Questions)' },
          { id: 'web-quiz-advanced', title: 'Advanced Quiz (50 Questions)' }
        ]
      }
    ]
  },
  {
    id: 'software-testing',
    title: 'Software Testing',
    icon: 'Target',
    sections: [
      {
        id: 'testing-basics',
        title: '1. Testing Basics',
        topics: [
          { id: 'test-intro', title: 'Software Testing Introduction' },
          { id: 'test-types', title: 'Types of Software Testing' },
          { id: 'test-manual', title: 'Manual Testing' },
          { id: 'test-stlc', title: 'Testing Life Cycle (STLC)' }
        ]
      },
      {
        id: 'testing-advanced',
        title: '2. Auto Testing',
        topics: [
          { id: 'test-automation', title: 'Automation Testing' },
          { id: 'test-agile', title: 'Agile Testing & API Testing' },
          { id: 'test-selenium', title: 'Selenium Introduction' },
          { id: 'test-interview', title: '300+ Testing Interview Questions' }
        ]
      },
      {
        id: 'test-quizzes',
        title: 'Quizzes & Assessments',
        topics: [
          { id: 'test-quiz-beginner', title: 'Beginner Quiz (50 Questions)' },
          { id: 'test-quiz-intermediate', title: 'Intermediate Quiz (50 Questions)' },
          { id: 'test-quiz-advanced', title: 'Advanced Quiz (50 Questions)' }
        ]
      }
    ]
  },
  {
    id: 'dsa-mastery',
    title: 'DSA (FAANG-level)',
    icon: 'Code2',
    sections: [
      {
        id: 'dsa-arrays',
        title: '1. Arrays',
        topics: [
          { id: 'dsa-arr-1', title: 'Two Sum / Three Sum / Four Sum' },
          { id: 'dsa-arr-2', title: "Maximum Subarray (Kadane's Algorithm)" },
          { id: 'dsa-arr-3', title: 'Best Time to Buy and Sell Stock (I, II, III, IV)' },
          { id: 'dsa-arr-4', title: 'Product of Array Except Self' },
          { id: 'dsa-arr-5', title: 'Maximum Product Subarray' },
          { id: 'dsa-arr-6', title: 'Find Minimum in Rotated Sorted Array' },
          { id: 'dsa-arr-7', title: 'Search in Rotated Sorted Array' },
          { id: 'dsa-arr-8', title: 'Container With Most Water' },
          { id: 'dsa-arr-9', title: 'Trapping Rain Water' },
          { id: 'dsa-arr-10', title: 'Next Permutation' },
          { id: 'dsa-arr-11', title: 'Rotate Array / Rotate Image' },
          { id: 'dsa-arr-12', title: 'Set Matrix Zeroes' },
          { id: 'dsa-arr-13', title: 'Spiral Matrix' },
          { id: 'dsa-arr-14', title: "Pascal's Triangle" },
          { id: 'dsa-arr-15', title: 'Merge Intervals' },
          { id: 'dsa-arr-16', title: 'Insert Interval' },
          { id: 'dsa-arr-17', title: 'Jump Game I & II' },
          { id: 'dsa-arr-18', title: 'Majority Element (Boyer-Moore)' },
          { id: 'dsa-arr-19', title: 'Find Duplicate Number' },
          { id: 'dsa-arr-20', title: 'Missing Number' },
          { id: 'dsa-arr-21', title: 'Move Zeroes' },
          { id: 'dsa-arr-22', title: 'Sort Colors (Dutch National Flag)' },
          { id: 'dsa-arr-23', title: 'Subarray Sum Equals K' },
          { id: 'dsa-arr-24', title: 'Longest Consecutive Sequence' },
          { id: 'dsa-arr-25', title: 'Sliding Window Maximum' },
          { id: 'dsa-arr-26', title: 'Minimum Size Subarray Sum' }
        ]
      },
      {
        id: 'dsa-strings',
        title: '2. Strings',
        topics: [
          { id: 'dsa-str-1', title: 'Reverse String / Reverse Words' },
          { id: 'dsa-str-2', title: 'Valid Anagram' },
          { id: 'dsa-str-3', title: 'Group Anagrams' },
          { id: 'dsa-str-4', title: 'Longest Substring Without Repeating Characters' },
          { id: 'dsa-str-5', title: 'Longest Palindromic Substring' },
          { id: 'dsa-str-6', title: 'Palindrome Check' },
          { id: 'dsa-str-7', title: 'String to Integer (atoi)' },
          { id: 'dsa-str-8', title: 'Valid Parentheses' },
          { id: 'dsa-str-9', title: 'Generate Parentheses' },
          { id: 'dsa-str-10', title: 'Longest Common Prefix' },
          { id: 'dsa-str-11', title: 'Count and Say' },
          { id: 'dsa-str-12', title: 'Decode String' },
          { id: 'dsa-str-13', title: 'Word Break I & II' },
          { id: 'dsa-str-14', title: 'Minimum Window Substring' },
          { id: 'dsa-str-15', title: 'Rabin-Karp / KMP Algorithm' },
          { id: 'dsa-str-16', title: 'Z-Algorithm' },
          { id: 'dsa-str-17', title: 'Roman to Integer / Integer to Roman' },
          { id: 'dsa-str-18', title: 'Zigzag Conversion' },
          { id: 'dsa-str-19', title: 'First Unique Character' },
          { id: 'dsa-str-20', title: 'Anagram in String (Find all anagrams)' },
        ]
      },
      {
        id: 'dsa-ll',
        title: '3. Linked List',
        topics: [
          { id: 'dsa-ll-1', title: 'Reverse Linked List (Iterative + Recursive)' },
          { id: 'dsa-ll-2', title: "Detect Cycle (Floyd's Algorithm)" },
          { id: 'dsa-ll-3', title: 'Find Start of Cycle' },
          { id: 'dsa-ll-4', title: 'Merge Two Sorted Lists' },
          { id: 'dsa-ll-5', title: 'Merge K Sorted Lists' },
          { id: 'dsa-ll-6', title: 'Remove Nth Node From End' },
          { id: 'dsa-ll-7', title: 'Middle of Linked List' },
          { id: 'dsa-ll-8', title: 'Intersection of Two Linked Lists' },
          { id: 'dsa-ll-9', title: 'Add Two Numbers' },
          { id: 'dsa-ll-10', title: 'Copy List with Random Pointer' },
          { id: 'dsa-ll-11', title: 'Flatten a Multilevel Doubly Linked List' },
          { id: 'dsa-ll-12', title: 'LRU Cache (LinkedList + HashMap)' },
          { id: 'dsa-ll-13', title: 'Palindrome Linked List' },
          { id: 'dsa-ll-14', title: 'Reorder List' },
          { id: 'dsa-ll-15', title: 'Sort List (Merge Sort on LL)' },
          { id: 'dsa-ll-16', title: 'Swap Nodes in Pairs' },
          { id: 'dsa-ll-17', title: 'Reverse Nodes in k-Group' },
        ]
      },
      {
        id: 'dsa-sq',
        title: '4. Stack & Queue',
        topics: [
          { id: 'dsa-sq-1', title: 'Valid Parentheses' },
          { id: 'dsa-sq-2', title: 'Min Stack' },
          { id: 'dsa-sq-3', title: 'Implement Stack using Queues' },
          { id: 'dsa-sq-4', title: 'Implement Queue using Stacks' },
          { id: 'dsa-sq-5', title: 'Daily Temperatures' },
          { id: 'dsa-sq-6', title: 'Next Greater Element I & II' },
          { id: 'dsa-sq-7', title: 'Largest Rectangle in Histogram' },
          { id: 'dsa-sq-8', title: 'Maximal Rectangle' },
          { id: 'dsa-sq-9', title: 'Evaluate Reverse Polish Notation' },
          { id: 'dsa-sq-10', title: 'Decode String' },
          { id: 'dsa-sq-11', title: 'Basic Calculator I & II' },
          { id: 'dsa-sq-12', title: 'Sliding Window Maximum (Deque)' },
          { id: 'dsa-sq-13', title: 'LRU Cache' },
          { id: 'dsa-sq-14', title: 'Design Circular Queue' },
        ]
      },
      {
        id: 'dsa-trees',
        title: '5. Trees (Binary Tree / BST)',
        topics: [
          { id: 'dsa-tree-1', title: 'Inorder / Preorder / Postorder Traversal' },
          { id: 'dsa-tree-2', title: 'Level Order Traversal (BFS)' },
          { id: 'dsa-tree-3', title: 'Zigzag Level Order Traversal' },
          { id: 'dsa-tree-4', title: 'Maximum Depth of Binary Tree' },
          { id: 'dsa-tree-5', title: 'Minimum Depth' },
          { id: 'dsa-tree-6', title: 'Diameter of Binary Tree' },
          { id: 'dsa-tree-7', title: 'Balanced Binary Tree' },
          { id: 'dsa-tree-8', title: 'Same Tree / Symmetric Tree' },
          { id: 'dsa-tree-9', title: 'Invert Binary Tree' },
          { id: 'dsa-tree-10', title: 'Path Sum I & II' },
          { id: 'dsa-tree-11', title: 'Maximum Path Sum' },
          { id: 'dsa-tree-12', title: 'Lowest Common Ancestor (LCA) — BT & BST' },
          { id: 'dsa-tree-13', title: 'Binary Tree Right Side View' },
          { id: 'dsa-tree-14', title: 'Count Complete Tree Nodes' },
          { id: 'dsa-tree-15', title: 'Serialize and Deserialize Binary Tree' },
          { id: 'dsa-tree-16', title: 'Flatten Binary Tree to Linked List' },
          { id: 'dsa-tree-17', title: 'Construct BT from Preorder + Inorder' },
          { id: 'dsa-tree-18', title: 'Construct BT from Postorder + Inorder' },
          { id: 'dsa-tree-19', title: 'Validate Binary Search Tree' },
          { id: 'dsa-tree-20', title: 'Kth Smallest in BST' },
          { id: 'dsa-tree-21', title: 'Delete Node in BST' },
          { id: 'dsa-tree-22', title: 'Insert into BST' },
          { id: 'dsa-tree-23', title: 'Convert Sorted Array to BST' },
          { id: 'dsa-tree-24', title: 'Binary Search Tree Iterator' },
          { id: 'dsa-tree-25', title: 'Recover BST' },
        ]
      },
      {
        id: 'dsa-tries',
        title: '6. Tries',
        topics: [
          { id: 'dsa-trie-1', title: 'Implement Trie (Insert, Search, StartsWith)' },
          { id: 'dsa-trie-2', title: 'Word Search II (Trie + Backtracking)' },
          { id: 'dsa-trie-3', title: 'Design Add and Search Words' },
          { id: 'dsa-trie-4', title: 'Replace Words' },
          { id: 'dsa-trie-5', title: 'Longest Word in Dictionary' },
          { id: 'dsa-trie-6', title: 'Palindrome Pairs' },
        ]
      },
      {
        id: 'dsa-heap',
        title: '7. Heap / Priority Queue',
        topics: [
          { id: 'dsa-heap-1', title: 'Kth Largest Element in Array' },
          { id: 'dsa-heap-2', title: 'Kth Smallest in Matrix' },
          { id: 'dsa-heap-3', title: 'Top K Frequent Elements' },
          { id: 'dsa-heap-4', title: 'Top K Frequent Words' },
          { id: 'dsa-heap-5', title: 'Merge K Sorted Lists' },
          { id: 'dsa-heap-6', title: 'Find Median from Data Stream' },
          { id: 'dsa-heap-7', title: 'Task Scheduler' },
          { id: 'dsa-heap-8', title: 'K Closest Points to Origin' },
          { id: 'dsa-heap-9', title: 'Reorganize String' },
          { id: 'dsa-heap-10', title: 'Smallest Range Covering Elements from K Lists' },
          { id: 'dsa-heap-11', title: 'Sliding Window Median' },
        ]
      },
      {
        id: 'dsa-graphs',
        title: '8. Graphs',
        topics: [
          { id: 'dsa-graph-1', title: 'BFS (Breadth First Search)' },
          { id: 'dsa-graph-2', title: 'DFS (Depth First Search)' },
          { id: 'dsa-graph-3', title: 'Number of Islands' },
          { id: 'dsa-graph-4', title: 'Clone Graph' },
          { id: 'dsa-graph-5', title: 'Course Schedule I & II (Topological Sort)' },
          { id: 'dsa-graph-6', title: 'Pacific Atlantic Water Flow' },
          { id: 'dsa-graph-7', title: 'Number of Connected Components' },
          { id: 'dsa-graph-8', title: 'Graph Valid Tree' },
          { id: 'dsa-graph-9', title: 'Longest Consecutive Sequence' },
          { id: 'dsa-graph-10', title: 'Word Ladder I & II' },
          { id: 'dsa-graph-11', title: 'Alien Dictionary (Topological Sort)' },
          { id: 'dsa-graph-12', title: "Dijkstra's Algorithm (Shortest Path)" },
          { id: 'dsa-graph-13', title: 'Bellman-Ford Algorithm' },
          { id: 'dsa-graph-14', title: 'Floyd-Warshall Algorithm' },
          { id: 'dsa-graph-15', title: "Prim's Algorithm (MST)" },
          { id: 'dsa-graph-16', title: "Kruskal's Algorithm (MST)" },
          { id: 'dsa-graph-17', title: 'Union-Find / Disjoint Set Union (DSU)' },
          { id: 'dsa-graph-18', title: 'Bipartite Graph Check' },
          { id: 'dsa-graph-19', title: 'Detect Cycle in Directed / Undirected Graph' },
          { id: 'dsa-graph-20', title: 'Minimum Spanning Tree' },
          { id: 'dsa-graph-21', title: 'Strongly Connected Components (Kosaraju / Tarjan)' },
          { id: 'dsa-graph-22', title: 'Critical Connections (Bridges in Graph)' },
          { id: 'dsa-graph-23', title: 'Accounts Merge' },
          { id: 'dsa-graph-24', title: 'Redundant Connection' },
          { id: 'dsa-graph-25', title: 'Swim in Rising Water' },
        ]
      },
      {
        id: 'dsa-bs',
        title: '9. Binary Search',
        topics: [
          { id: 'dsa-bs-1', title: 'Binary Search (Classic)' },
          { id: 'dsa-bs-2', title: 'Search a 2D Matrix' },
          { id: 'dsa-bs-3', title: 'Find Peak Element' },
          { id: 'dsa-bs-4', title: 'Search in Rotated Sorted Array' },
          { id: 'dsa-bs-5', title: 'Find Minimum in Rotated Sorted Array' },
          { id: 'dsa-bs-6', title: 'Kth Smallest in Sorted Matrix' },
          { id: 'dsa-bs-7', title: 'Median of Two Sorted Arrays' },
          { id: 'dsa-bs-8', title: 'Capacity to Ship Packages' },
          { id: 'dsa-bs-9', title: 'Koko Eating Bananas' },
          { id: 'dsa-bs-10', title: 'Split Array Largest Sum' },
          { id: 'dsa-bs-11', title: 'Find K Closest Elements' },
          { id: 'dsa-bs-12', title: 'Aggressive Cows (Classic)' },
          { id: 'dsa-bs-13', title: "Painter's Partition Problem" },
          { id: 'dsa-bs-14', title: 'Book Allocation Problem' },
        ]
      },
      {
        id: 'dsa-recursion',
        title: '10. Recursion & Backtracking',
        topics: [
          { id: 'dsa-rec-1', title: 'Subsets I & II' },
          { id: 'dsa-rec-2', title: 'Permutations I & II' },
          { id: 'dsa-rec-3', title: 'Combination Sum I & II & III' },
          { id: 'dsa-rec-4', title: 'N-Queens' },
          { id: 'dsa-rec-5', title: 'Sudoku Solver' },
          { id: 'dsa-rec-6', title: 'Word Search' },
          { id: 'dsa-rec-7', title: 'Palindrome Partitioning' },
          { id: 'dsa-rec-8', title: 'Letter Combinations of Phone Number' },
          { id: 'dsa-rec-9', title: 'Restore IP Addresses' },
          { id: 'dsa-rec-10', title: 'Generate Parentheses' },
          { id: 'dsa-rec-11', title: 'Rat in a Maze' },
          { id: 'dsa-rec-12', title: 'M-Coloring Problem' },
        ]
      },
      {
        id: 'dsa-dp',
        title: '11. Dynamic Programming',
        topics: [
          { id: 'dsa-dp-1', title: '1D DP: Climbing Stairs, House Robber, Jump Game' },
          { id: 'dsa-dp-2', title: '1D DP: Decode Ways, Word Break, Coin Change' },
          { id: 'dsa-dp-3', title: '2D DP: Unique Paths, Min Path Sum, Edit Distance' },
          { id: 'dsa-dp-4', title: '2D DP: LCS, 0/1 Knapsack, Target Sum' },
          { id: 'dsa-dp-5', title: 'DP on Strings: Palindromic Subsequence, Wildcard' },
          { id: 'dsa-dp-6', title: 'DP on Stocks: Buy/Sell Stock (all 6 variants)' },
          { id: 'dsa-dp-7', title: 'DP on Trees: House Robber III, BT Max Path Sum' },
          { id: 'dsa-dp-8', title: 'Advanced DP: MCM, Burst Balloons, Egg Drop' },
          { id: 'dsa-dp-9', title: 'Advanced DP: DP on Digits, DP on Bitmask' },
        ]
      },
      {
        id: 'dsa-math',
        title: '12. Math & Number Theory',
        topics: [
          { id: 'dsa-math-1', title: 'Sieve of Eratosthenes (Prime Numbers)' },
          { id: 'dsa-math-2', title: 'GCD / LCM (Euclidean Algorithm)' },
          { id: 'dsa-math-3', title: 'Power of X (Fast Exponentiation)' },
          { id: 'dsa-math-4', title: 'Sqrt(x)' },
          { id: 'dsa-math-5', title: 'Reverse Integer' },
          { id: 'dsa-math-6', title: 'Happy Number' },
          { id: 'dsa-math-7', title: 'Excel Sheet Column Number' },
          { id: 'dsa-math-8', title: 'Count Primes' },
          { id: 'dsa-math-9', title: 'Factorial Trailing Zeroes' },
          { id: 'dsa-math-10', title: 'Number of 1 Bits (Hamming Weight)' },
          { id: 'dsa-math-11', title: 'Single Number I, II, III' },
          { id: 'dsa-math-12', title: 'Bits Counting' },
        ]
      },
      {
        id: 'dsa-bit',
        title: '13. Bit Manipulation',
        topics: [
          { id: 'dsa-bit-1', title: 'Single Number' },
          { id: 'dsa-bit-2', title: 'Number of 1 Bits' },
          { id: 'dsa-bit-3', title: 'Reverse Bits' },
          { id: 'dsa-bit-4', title: 'Missing Number' },
          { id: 'dsa-bit-5', title: 'Counting Bits' },
          { id: 'dsa-bit-6', title: 'Power of Two / Three / Four' },
          { id: 'dsa-bit-7', title: 'Sum of Two Integers (without +)' },
          { id: 'dsa-bit-8', title: 'Bitwise AND of Numbers Range' },
          { id: 'dsa-bit-9', title: 'XOR Tricks' },
        ]
      },
      {
        id: 'dsa-greedy',
        title: '14. Greedy Algorithms',
        topics: [
          { id: 'dsa-greedy-1', title: 'Activity Selection Problem' },
          { id: 'dsa-greedy-2', title: 'Fractional Knapsack' },
          { id: 'dsa-greedy-3', title: 'Jump Game I & II' },
          { id: 'dsa-greedy-4', title: 'Gas Station' },
          { id: 'dsa-greedy-5', title: 'Task Scheduler' },
          { id: 'dsa-greedy-6', title: 'Candy Distribution' },
          { id: 'dsa-greedy-7', title: 'Meeting Rooms I & II' },
          { id: 'dsa-greedy-8', title: 'Minimum Number of Arrows' },
          { id: 'dsa-greedy-9', title: 'Non-overlapping Intervals' },
          { id: 'dsa-greedy-10', title: 'Partition Labels' },
        ]
      },
      {
        id: 'dsa-sorting',
        title: '15. Sorting Algorithms (Implementation)',
        topics: [
          { id: 'dsa-sort-1', title: 'Bubble Sort' },
          { id: 'dsa-sort-2', title: 'Selection Sort' },
          { id: 'dsa-sort-3', title: 'Insertion Sort' },
          { id: 'dsa-sort-4', title: 'Merge Sort' },
          { id: 'dsa-sort-5', title: 'Quick Sort' },
          { id: 'dsa-sort-6', title: 'Counting Sort' },
          { id: 'dsa-sort-7', title: 'Radix Sort' },
          { id: 'dsa-sort-8', title: 'Heap Sort' },
          { id: 'dsa-sort-9', title: 'Tim Sort (concept)' },
        ]
      },
      {
        id: 'dsa-design',
        title: '16. Design / System-Level DS',
        topics: [
          { id: 'dsa-dsgn-1', title: 'LRU Cache' },
          { id: 'dsa-dsgn-2', title: 'LFU Cache' },
          { id: 'dsa-dsgn-3', title: 'Design HashMap / HashSet' },
          { id: 'dsa-dsgn-4', title: 'Design Linked List' },
          { id: 'dsa-dsgn-5', title: 'Min Stack / Max Stack' },
          { id: 'dsa-dsgn-6', title: 'Design Twitter' },
          { id: 'dsa-dsgn-7', title: 'Design Tic Tac Toe' },
          { id: 'dsa-dsgn-8', title: 'Implement Iterator' },
          { id: 'dsa-dsgn-9', title: 'Design Circular Deque' },
          { id: 'dsa-dsgn-10', title: 'Design Snake Game' },
        ]
      },
      {
        id: 'dsa-segment',
        title: '17. Segment Tree & Advanced',
        topics: [
          { id: 'dsa-seg-1', title: 'Segment Tree (Build, Query, Update)' },
          { id: 'dsa-seg-2', title: 'Lazy Propagation' },
          { id: 'dsa-seg-3', title: 'Fenwick Tree / Binary Indexed Tree (BIT)' },
          { id: 'dsa-seg-4', title: 'Range Sum Query — Mutable' },
          { id: 'dsa-seg-5', title: 'Count of Smaller Numbers After Self' },
          { id: 'dsa-seg-6', title: 'Merge Sort Tree' },
        ]
      },
      {
        id: 'dsa-two-pointers',
        title: '18. Two Pointers & Sliding Window',
        topics: [
          { id: 'dsa-tp-1', title: 'Two Sum (Sorted Array)' },
          { id: 'dsa-tp-2', title: '3Sum / 4Sum' },
          { id: 'dsa-tp-3', title: 'Remove Duplicates' },
          { id: 'dsa-tp-4', title: 'Valid Palindrome' },
          { id: 'dsa-tp-5', title: 'Minimum Window Substring' },
          { id: 'dsa-tp-6', title: 'Longest Repeating Character Replacement' },
          { id: 'dsa-tp-7', title: 'Permutation in String' },
          { id: 'dsa-tp-8', title: 'Fruits Into Baskets' },
          { id: 'dsa-tp-9', title: 'Maximum Points from Cards' },
        ]
      },
      {
        id: 'dsa-intervals',
        title: '19. Intervals',
        topics: [
          { id: 'dsa-int-1', title: 'Merge Intervals' },
          { id: 'dsa-int-2', title: 'Insert Interval' },
          { id: 'dsa-int-3', title: 'Meeting Rooms I & II' },
          { id: 'dsa-int-4', title: 'Non-overlapping Intervals' },
          { id: 'dsa-int-5', title: 'Minimum Interval to Include Query' },
        ]
      },
      {
        id: 'dsa-adv-graph',
        title: '20. Advanced Graph (FAANG Level)',
        topics: [
          { id: 'dsa-ag-1', title: "Tarjan's Algorithm (SCC + Bridges)" },
          { id: 'dsa-ag-2', title: 'Articulation Points' },
          { id: 'dsa-ag-3', title: 'Eulerian Path / Circuit' },
          { id: 'dsa-ag-4', title: 'Hamiltonian Path (concept)' },
          { id: 'dsa-ag-5', title: 'A* Search Algorithm' },
          { id: 'dsa-ag-6', title: 'Multi-source BFS' },
          { id: 'dsa-ag-7', title: '0-1 BFS' },
          { id: 'dsa-ag-8', title: 'Bidirectional BFS' },
        ]
      },
      {
        id: 'dsa-mastery-quizzes',
        title: 'Quizzes & Assessments',
        topics: [
          { id: 'dsa-mastery-quiz-beginner', title: 'Beginner Quiz (50 Questions)' },
          { id: 'dsa-mastery-quiz-intermediate', title: 'Intermediate Quiz (50 Questions)' },
          { id: 'dsa-mastery-quiz-advanced', title: 'Advanced Quiz (50 Questions)' }
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  //  PYTHON MASTERY
  // ─────────────────────────────────────────────────────────────
  {
    id: 'python-mastery',
    title: 'Python Mastery',
    icon: 'Code2',
    sections: [
      {
        id: 'py-basics',
        title: '1. Python Basics',
        topics: [
          { id: 'py-what-is', title: 'What is Python?' },
          { id: 'py-install', title: 'Installing Python & Setup' },
          { id: 'py-hello-world', title: 'Hello World Program' },
          { id: 'py-variables', title: 'Variables & Data Types' },
          { id: 'py-strings', title: 'Strings & String Methods' },
          { id: 'py-numbers', title: 'Numbers, Math & Operators' },
          { id: 'py-input-output', title: 'Input / Output' },
          { id: 'py-type-conversion', title: 'Type Conversion' },
          { id: 'py-if-else', title: 'if / elif / else' },
          { id: 'py-loops', title: 'for & while Loops' },
          { id: 'py-break-continue', title: 'break, continue, pass' },
          { id: 'py-lists', title: 'Lists' },
          { id: 'py-tuples', title: 'Tuples' },
          { id: 'py-sets', title: 'Sets' },
          { id: 'py-dicts', title: 'Dictionaries' },
          { id: 'py-functions', title: 'Functions & Arguments' },
          { id: 'py-lambda', title: 'Lambda Functions' },
          { id: 'py-list-comp', title: 'List Comprehensions' },
          { id: 'py-dict-comp', title: 'Dictionary Comprehensions' },
        ]
      },
      {
        id: 'py-intermediate',
        title: '2. Intermediate Python',
        topics: [
          { id: 'py-oop', title: 'OOP — Classes & Objects' },
          { id: 'py-inheritance', title: 'Inheritance & Polymorphism' },
          { id: 'py-dunder', title: 'Magic / Dunder Methods' },
          { id: 'py-decorators', title: 'Decorators' },
          { id: 'py-generators', title: 'Generators & yield' },
          { id: 'py-iterators', title: 'Iterators & Itertools' },
          { id: 'py-context-managers', title: 'Context Managers (with)' },
          { id: 'py-exceptions', title: 'Exception Handling' },
          { id: 'py-file-io', title: 'File I/O' },
          { id: 'py-modules', title: 'Modules & Packages' },
          { id: 'py-regex', title: 'Regular Expressions' },
          { id: 'py-collections', title: 'Collections Module' },
          { id: 'py-functools', title: 'functools & map/filter/reduce' },
        ]
      },
      {
        id: 'py-advanced',
        title: '3. Advanced Python',
        topics: [
          { id: 'py-async', title: 'Async / Await & asyncio' },
          { id: 'py-threading', title: 'Threading & Multiprocessing' },
          { id: 'py-metaclasses', title: 'Metaclasses' },
          { id: 'py-descriptors', title: 'Descriptors & Properties' },
          { id: 'py-slots', title: '__slots__ & Memory Optimization' },
          { id: 'py-typing', title: 'Type Hints & mypy' },
          { id: 'py-testing', title: 'Testing with pytest' },
          { id: 'py-packaging', title: 'Packaging & pyproject.toml' },
          { id: 'py-venv', title: 'Virtual Environments & pip' },
          { id: 'py-performance', title: 'Performance & Profiling' },
        ]
      },
      {
        id: 'py-quizzes',
        title: 'Quizzes',
        topics: [
          { id: 'py-quiz-beginner', title: 'Beginner Quiz (50 Questions)' },
          { id: 'py-quiz-intermediate', title: 'Intermediate Quiz (50 Questions)' },
          { id: 'py-quiz-advanced', title: 'Advanced Quiz (50 Questions)' },
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  //  GO (GOLANG) MASTERY
  // ─────────────────────────────────────────────────────────────
  {
    id: 'go-mastery',
    title: 'Go (Golang) Mastery',
    icon: 'Code2',
    sections: [
      {
        id: 'go-basics',
        title: '1. Go Basics',
        topics: [
          { id: 'go-intro', title: 'What is Go & Why Use It?' },
          { id: 'go-setup', title: 'Install Go & First Program' },
          { id: 'go-variables', title: 'Variables, Constants & Types' },
          { id: 'go-control-flow', title: 'Control Flow (if, for, switch)' },
          { id: 'go-functions', title: 'Functions & Multiple Returns' },
          { id: 'go-arrays-slices', title: 'Arrays & Slices' },
          { id: 'go-maps', title: 'Maps' },
          { id: 'go-structs', title: 'Structs' },
          { id: 'go-pointers', title: 'Pointers in Go' },
        ]
      },
      {
        id: 'go-intermediate',
        title: '2. Intermediate Go',
        topics: [
          { id: 'go-interfaces', title: 'Interfaces & Polymorphism' },
          { id: 'go-methods', title: 'Methods & Receivers' },
          { id: 'go-error-handling', title: 'Error Handling (errors, fmt.Errorf)' },
          { id: 'go-goroutines', title: 'Goroutines & Concurrency' },
          { id: 'go-channels', title: 'Channels & select' },
          { id: 'go-waitgroup-mutex', title: 'WaitGroup & Mutex' },
          { id: 'go-packages', title: 'Packages & Modules (go.mod)' },
          { id: 'go-testing', title: 'Testing in Go' },
        ]
      },
      {
        id: 'go-advanced',
        title: '3. Advanced Go',
        topics: [
          { id: 'go-context', title: 'Context Package' },
          { id: 'go-generics', title: 'Generics (Go 1.18+)' },
          { id: 'go-reflection', title: 'Reflection' },
          { id: 'go-rest-api', title: 'Building REST APIs (net/http)' },
          { id: 'go-gin', title: 'Gin Framework' },
          { id: 'go-grpc', title: 'gRPC with Go' },
          { id: 'go-docker', title: 'Dockerizing Go Apps' },
          { id: 'go-performance', title: 'Performance & Profiling (pprof)' },
        ]
      },
      {
        id: 'go-quizzes',
        title: 'Quizzes',
        topics: [
          { id: 'go-quiz-beginner', title: 'Beginner Quiz (50 Questions)' },
          { id: 'go-quiz-intermediate', title: 'Intermediate Quiz (50 Questions)' },
          { id: 'go-quiz-advanced', title: 'Advanced Quiz (50 Questions)' },
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  //  RAG — RETRIEVAL AUGMENTED GENERATION
  // ─────────────────────────────────────────────────────────────
  {
    id: 'rag-mastery',
    title: 'RAG — Retrieval Augmented Generation',
    icon: 'Database',
    sections: [
      {
        id: 'rag-basics',
        title: '1. RAG Basics',
        topics: [
          { id: 'rag-what-is', title: 'What is RAG?' },
          { id: 'rag-why', title: 'Why RAG? (vs Fine-tuning)' },
          { id: 'rag-architecture', title: 'RAG Architecture Overview' },
          { id: 'rag-embeddings', title: 'Text Embeddings & Semantic Search' },
          { id: 'rag-chunking', title: 'Document Chunking Strategies' },
          { id: 'rag-vector-stores', title: 'Vector Stores (Pinecone, Chroma, pgvector)' },
          { id: 'rag-retrieval', title: 'Retrieval Methods (Similarity, MMR, BM25)' },
          { id: 'rag-generation', title: 'Generation with Context' },
        ]
      },
      {
        id: 'rag-advanced',
        title: '2. Advanced RAG',
        topics: [
          { id: 'rag-hybrid-search', title: 'Hybrid Search (Dense + Sparse)' },
          { id: 'rag-reranking', title: 'Reranking with Cross-Encoders' },
          { id: 'rag-query-expansion', title: 'Query Expansion & HyDE' },
          { id: 'rag-multi-hop', title: 'Multi-hop Reasoning' },
          { id: 'rag-parent-child', title: 'Parent-Child Chunking' },
          { id: 'rag-citations', title: 'Source Citations & Attribution' },
          { id: 'rag-evaluation', title: 'RAG Evaluation (RAGAS)' },
          { id: 'rag-production', title: 'Production RAG Pipeline' },
        ]
      },
      {
        id: 'rag-quizzes',
        title: 'Quizzes',
        topics: [
          { id: 'rag-quiz-beginner', title: 'Beginner Quiz (50 Questions)' },
          { id: 'rag-quiz-advanced', title: 'Advanced Quiz (50 Questions)' },
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  //  TYPESCRIPT MASTERY
  // ─────────────────────────────────────────────────────────────
  {
    id: 'typescript-mastery',
    title: 'TypeScript Mastery',
    icon: 'Code2',
    sections: [
      {
        id: 'ts-basics',
        title: '1. TypeScript Basics',
        topics: [
          { id: 'ts-what-is', title: 'What is TypeScript?' },
          { id: 'ts-setup', title: 'Setup & tsconfig.json' },
          { id: 'ts-basic-types', title: 'Basic Types (string, number, boolean)' },
          { id: 'ts-arrays-tuples', title: 'Arrays & Tuples' },
          { id: 'ts-interfaces', title: 'Interfaces' },
          { id: 'ts-type-aliases', title: 'Type Aliases & Unions' },
          { id: 'ts-enums', title: 'Enums' },
          { id: 'ts-functions', title: 'Function Types' },
          { id: 'ts-classes', title: 'Classes with TypeScript' },
        ]
      },
      {
        id: 'ts-advanced',
        title: '2. Advanced TypeScript',
        topics: [
          { id: 'ts-generics', title: 'Generics' },
          { id: 'ts-utility-types', title: 'Utility Types (Partial, Pick, Omit…)' },
          { id: 'ts-conditional-types', title: 'Conditional Types' },
          { id: 'ts-mapped-types', title: 'Mapped Types' },
          { id: 'ts-template-literals', title: 'Template Literal Types' },
          { id: 'ts-infer', title: 'infer keyword' },
          { id: 'ts-decorators', title: 'Decorators' },
          { id: 'ts-declaration-files', title: 'Declaration Files (.d.ts)' },
          { id: 'ts-with-react', title: 'TypeScript with React' },
          { id: 'ts-with-node', title: 'TypeScript with Node.js' },
        ]
      },
      {
        id: 'ts-quizzes',
        title: 'Quizzes',
        topics: [
          { id: 'ts-quiz-beginner', title: 'Beginner Quiz (50 Questions)' },
          { id: 'ts-quiz-advanced', title: 'Advanced Quiz (50 Questions)' },
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  //  LINUX & BASH
  // ─────────────────────────────────────────────────────────────
  {
    id: 'linux-mastery',
    title: 'Linux & Bash Scripting',
    icon: 'Terminal',
    sections: [
      {
        id: 'linux-basics',
        title: '1. Linux Basics',
        topics: [
          { id: 'linux-intro', title: 'Introduction to Linux' },
          { id: 'linux-file-system', title: 'File System & Directory Structure' },
          { id: 'linux-commands', title: 'Essential Commands (ls, cd, cp, mv, rm)' },
          { id: 'linux-permissions', title: 'File Permissions (chmod, chown)' },
          { id: 'linux-processes', title: 'Process Management (ps, kill, top)' },
          { id: 'linux-networking', title: 'Networking (ifconfig, netstat, curl)' },
          { id: 'linux-ssh', title: 'SSH & Remote Access' },
          { id: 'linux-package-mgmt', title: 'Package Management (apt, yum, dnf)' },
          { id: 'linux-cron', title: 'Cron Jobs & Scheduling' },
        ]
      },
      {
        id: 'bash-scripting',
        title: '2. Bash Scripting',
        topics: [
          { id: 'bash-intro', title: 'Bash Script Basics' },
          { id: 'bash-variables', title: 'Variables & Environment' },
          { id: 'bash-control-flow', title: 'if/else, loops, case' },
          { id: 'bash-functions', title: 'Functions in Bash' },
          { id: 'bash-text-processing', title: 'Text Processing (grep, awk, sed)' },
          { id: 'bash-pipes', title: 'Pipes & Redirection' },
          { id: 'bash-automation', title: 'Automation Scripts' },
          { id: 'bash-arrays', title: 'Arrays & String Operations' },
        ]
      },
      {
        id: 'linux-quizzes',
        title: 'Quizzes',
        topics: [
          { id: 'linux-quiz-beginner', title: 'Beginner Quiz (50 Questions)' },
          { id: 'linux-quiz-advanced', title: 'Advanced Quiz (50 Questions)' },
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  //  RUST
  // ─────────────────────────────────────────────────────────────
  {
    id: 'rust-mastery',
    title: 'Rust Mastery',
    icon: 'Code2',
    sections: [
      {
        id: 'rust-basics',
        title: '1. Rust Fundamentals',
        topics: [
          { id: 'rust-intro', title: 'Why Rust? Memory Safety without GC' },
          { id: 'rust-setup', title: 'Installing Rust (rustup)' },
          { id: 'rust-hello-world', title: 'Hello World & Cargo' },
          { id: 'rust-variables', title: 'Variables, Mutability & Constants' },
          { id: 'rust-data-types', title: 'Data Types (Scalar & Compound)' },
          { id: 'rust-functions', title: 'Functions & Expressions' },
          { id: 'rust-control-flow', title: 'Control Flow (if, loop, while, for)' },
        ]
      },
      {
        id: 'rust-ownership',
        title: '2. Ownership (Rust\'s Core)',
        topics: [
          { id: 'rust-ownership-concept', title: 'Ownership Rules' },
          { id: 'rust-borrowing', title: 'References & Borrowing' },
          { id: 'rust-slices', title: 'Slices' },
          { id: 'rust-lifetimes', title: 'Lifetimes' },
          { id: 'rust-move-copy', title: 'Move vs Copy Semantics' },
          { id: 'rust-smart-pointers', title: 'Smart Pointers (Box, Rc, Arc, RefCell)' },
        ]
      },
      {
        id: 'rust-structs-enums',
        title: '3. Structs, Enums & Traits',
        topics: [
          { id: 'rust-structs', title: 'Structs & Methods' },
          { id: 'rust-enums', title: 'Enums & Pattern Matching' },
          { id: 'rust-option', title: 'Option<T> — Null Safety' },
          { id: 'rust-result', title: 'Result<T,E> — Error Handling' },
          { id: 'rust-traits', title: 'Traits — Interfaces in Rust' },
          { id: 'rust-generics', title: 'Generics in Rust' },
          { id: 'rust-closures', title: 'Closures & Iterators' },
        ]
      },
      {
        id: 'rust-advanced',
        title: '4. Advanced Rust',
        topics: [
          { id: 'rust-concurrency', title: 'Fearless Concurrency in Rust' },
          { id: 'rust-async', title: 'Async/Await in Rust' },
          { id: 'rust-macros', title: 'Macros in Rust' },
          { id: 'rust-unsafe', title: 'Unsafe Rust' },
          { id: 'rust-web-axum', title: 'Web with Axum Framework' },
          { id: 'rust-wasm', title: 'Rust + WebAssembly' },
          { id: 'rust-interview', title: 'Rust Interview Questions' },
        ]
      },
      {
        id: 'rust-quizzes',
        title: 'Quizzes',
        topics: [
          { id: 'rust-quiz-beginner', title: 'Beginner Quiz (50 Questions)' },
          { id: 'rust-quiz-advanced', title: 'Advanced Quiz (50 Questions)' },
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  //  C++ MASTERY
  // ─────────────────────────────────────────────────────────────
  {
    id: 'cpp-mastery',
    title: 'C++ Mastery',
    icon: 'Code2',
    sections: [
      {
        id: 'cpp-basics',
        title: '1. C++ Fundamentals',
        topics: [
          { id: 'cpp-intro', title: 'Introduction to C++' },
          { id: 'cpp-setup', title: 'Setup: g++, IDE, Compilation' },
          { id: 'cpp-hello-world', title: 'Hello World Program' },
          { id: 'cpp-variables', title: 'Variables & Data Types' },
          { id: 'cpp-io', title: 'cin/cout — Input & Output' },
          { id: 'cpp-operators', title: 'Operators & Expressions' },
          { id: 'cpp-control-flow', title: 'if/else, switch, loops' },
          { id: 'cpp-functions', title: 'Functions (Declaration, Definition, Overloading)' },
          { id: 'cpp-arrays', title: 'Arrays & Strings' },
          { id: 'cpp-pointers', title: 'Pointers & References' },
        ]
      },
      {
        id: 'cpp-oop',
        title: '2. Object-Oriented Programming',
        topics: [
          { id: 'cpp-classes', title: 'Classes & Objects' },
          { id: 'cpp-constructors', title: 'Constructors & Destructors' },
          { id: 'cpp-access-modifiers', title: 'Access Modifiers' },
          { id: 'cpp-inheritance', title: 'Inheritance' },
          { id: 'cpp-polymorphism', title: 'Polymorphism & Virtual Functions' },
          { id: 'cpp-abstract', title: 'Abstract Classes & Pure Virtual' },
          { id: 'cpp-encapsulation', title: 'Encapsulation & Friend Functions' },
          { id: 'cpp-operator-overloading', title: 'Operator Overloading' },
        ]
      },
      {
        id: 'cpp-stl',
        title: '3. STL & Modern C++',
        topics: [
          { id: 'cpp-stl-intro', title: 'Standard Template Library (STL)' },
          { id: 'cpp-vector', title: 'vector — Dynamic Arrays' },
          { id: 'cpp-map-set', title: 'map, set, unordered_map' },
          { id: 'cpp-stack-queue', title: 'stack, queue, priority_queue' },
          { id: 'cpp-algorithms', title: 'STL Algorithms (sort, find, etc.)' },
          { id: 'cpp-templates', title: 'Templates (Generic Programming)' },
          { id: 'cpp-lambda', title: 'Lambda Functions' },
          { id: 'cpp-smart-pointers', title: 'Smart Pointers (unique_ptr, shared_ptr)' },
          { id: 'cpp-move-semantics', title: 'Move Semantics & Rvalue References' },
          { id: 'cpp-concurrency', title: 'Multithreading (std::thread)' },
        ]
      },
      {
        id: 'cpp-quizzes',
        title: 'Quizzes',
        topics: [
          { id: 'cpp-quiz-beginner', title: 'Beginner Quiz (50 Questions)' },
          { id: 'cpp-quiz-intermediate', title: 'Intermediate Quiz (50 Questions)' },
          { id: 'cpp-quiz-advanced', title: 'Advanced Quiz (50 Questions)' },
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  //  PROMPT ENGINEERING
  // ─────────────────────────────────────────────────────────────
  {
    id: 'prompt-engineering',
    title: 'Prompt Engineering',
    icon: 'Sparkles',
    sections: [
      {
        id: 'pe-fundamentals',
        title: '1. Fundamentals',
        topics: [
          { id: 'pe-what-is', title: 'What is Prompt Engineering?' },
          { id: 'pe-how-llms-work', title: 'How LLMs Work (Tokens, Context, Attention)' },
          { id: 'pe-zero-shot', title: 'Zero-Shot Prompting' },
          { id: 'pe-few-shot', title: 'Few-Shot Prompting' },
          { id: 'pe-role-playing', title: 'Role & Persona Prompting' },
          { id: 'pe-instruction-tuning', title: 'Instruction Following & System Prompts' },
          { id: 'pe-output-format', title: 'Controlling Output Format (JSON, Markdown, Lists)' },
        ]
      },
      {
        id: 'pe-advanced-techniques',
        title: '2. Advanced Techniques',
        topics: [
          { id: 'pe-cot', title: 'Chain of Thought (CoT) Prompting' },
          { id: 'pe-tot', title: 'Tree of Thoughts (ToT)' },
          { id: 'pe-react', title: 'ReAct — Reason + Act Pattern' },
          { id: 'pe-self-consistency', title: 'Self-Consistency & Majority Voting' },
          { id: 'pe-step-back', title: 'Step-Back Prompting' },
          { id: 'pe-meta-prompting', title: 'Meta-Prompting' },
          { id: 'pe-structured-output', title: 'Structured Output & JSON Schema' },
          { id: 'pe-context-injection', title: 'Context Injection & RAG Prompts' },
        ]
      },
      {
        id: 'pe-safety',
        title: '3. Prompt Safety & Optimization',
        topics: [
          { id: 'pe-injection', title: 'Prompt Injection Attacks & Defense' },
          { id: 'pe-jailbreaking', title: 'Jailbreaking & Safety Bypasses' },
          { id: 'pe-hallucination', title: 'Reducing Hallucinations' },
          { id: 'pe-temperature', title: 'Temperature, Top-p, Max Tokens' },
          { id: 'pe-evaluation', title: 'Evaluating Prompt Quality' },
          { id: 'pe-optimization', title: 'Prompt Optimization & A/B Testing' },
          { id: 'pe-cost', title: 'Cost Optimization (Token Counting)' },
        ]
      },
      {
        id: 'pe-applied',
        title: '4. Applied Prompt Engineering',
        topics: [
          { id: 'pe-code-generation', title: 'Prompts for Code Generation' },
          { id: 'pe-summarization', title: 'Summarization Prompts' },
          { id: 'pe-data-extraction', title: 'Data Extraction from Unstructured Text' },
          { id: 'pe-classification', title: 'Classification & Sentiment Analysis' },
          { id: 'pe-translation', title: 'Translation & Multilingual Prompts' },
          { id: 'pe-chat-design', title: 'Designing Chatbot System Prompts' },
          { id: 'pe-interview', title: 'Prompt Engineering Interview Questions' },
        ]
      },
      {
        id: 'pe-quizzes',
        title: 'Quizzes',
        topics: [
          { id: 'pe-quiz-beginner', title: 'Beginner Quiz (50 Questions)' },
          { id: 'pe-quiz-advanced', title: 'Advanced Quiz (50 Questions)' },
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  //  AGENTIC AI
  // ─────────────────────────────────────────────────────────────
  {
    id: 'agentic-ai',
    title: 'Agentic AI & AI Agents',
    icon: 'BrainCircuit',
    sections: [
      {
        id: 'agents-fundamentals',
        title: '1. What are AI Agents?',
        topics: [
          { id: 'agents-intro', title: 'What are AI Agents? (vs Chatbots)' },
          { id: 'agents-architecture', title: 'Agent Architecture: Perception → Plan → Act' },
          { id: 'agents-types', title: 'Types of Agents (Reactive, Goal-based, Learning)' },
          { id: 'agents-llm-as-brain', title: 'LLMs as the Brain of an Agent' },
          { id: 'agents-environment', title: 'Agent Environment & State' },
          { id: 'agents-tools', title: 'Tools — Giving Agents Abilities' },
          { id: 'agents-memory', title: 'Memory in Agents (Short-term vs Long-term)' },
        ]
      },
      {
        id: 'agents-patterns',
        title: '2. Agentic Patterns',
        topics: [
          { id: 'agents-react-pattern', title: 'ReAct Pattern (Reason + Act)' },
          { id: 'agents-function-calling', title: 'Function Calling & Tool Use' },
          { id: 'agents-planning', title: 'Planning Agents (Task Decomposition)' },
          { id: 'agents-reflection', title: 'Reflection & Self-Critique' },
          { id: 'agents-multi-agent', title: 'Multi-Agent Systems' },
          { id: 'agents-orchestrator', title: 'Orchestrator & Subagent Pattern' },
          { id: 'agents-human-in-loop', title: 'Human-in-the-Loop Design' },
        ]
      },
      {
        id: 'agents-frameworks',
        title: '3. Agent Frameworks',
        topics: [
          { id: 'agents-langchain', title: 'LangChain Agents' },
          { id: 'agents-llamaindex', title: 'LlamaIndex Agents' },
          { id: 'agents-autogen', title: 'AutoGen — Multi-Agent Conversations' },
          { id: 'agents-crewai', title: 'CrewAI — Role-based Agents' },
          { id: 'agents-openai-assistants', title: 'OpenAI Assistants API' },
          { id: 'agents-claude-mcp', title: 'Claude MCP (Model Context Protocol)' },
          { id: 'agents-dspy', title: 'DSPy — Programmatic LM Pipelines' },
        ]
      },
      {
        id: 'agents-rag',
        title: '4. RAG & Knowledge Agents',
        topics: [
          { id: 'rag-intro', title: 'RAG — Retrieval Augmented Generation' },
          { id: 'rag-architecture', title: 'RAG Architecture (Index → Retrieve → Generate)' },
          { id: 'rag-chunking', title: 'Text Chunking Strategies' },
          { id: 'rag-embeddings', title: 'Embeddings & Semantic Search' },
          { id: 'rag-vector-stores', title: 'Vector Databases (Pinecone, Chroma, Qdrant)' },
          { id: 'rag-reranking', title: 'Reranking & Hybrid Search' },
          { id: 'rag-advanced', title: 'Advanced RAG (Self-RAG, Corrective RAG)' },
          { id: 'rag-evaluation', title: 'RAG Evaluation (Ragas, DeepEval)' },
        ]
      },
      {
        id: 'agents-production',
        title: '5. Production & Evaluation',
        topics: [
          { id: 'agents-observability', title: 'Agent Observability & Tracing (LangSmith)' },
          { id: 'agents-evaluation', title: 'Evaluating Agent Performance' },
          { id: 'agents-guardrails', title: 'Safety & Guardrails' },
          { id: 'agents-cost', title: 'Cost Management for Agents' },
          { id: 'agents-deployment', title: 'Deploying Agents to Production' },
          { id: 'agents-future', title: 'Future of Agentic AI' },
          { id: 'agents-interview', title: 'Agentic AI Interview Questions' },
        ]
      },
      {
        id: 'agents-quizzes',
        title: 'Quizzes',
        topics: [
          { id: 'agents-quiz-beginner', title: 'Beginner Quiz (50 Questions)' },
          { id: 'agents-quiz-advanced', title: 'Advanced Quiz (50 Questions)' },
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  //  MACHINE LEARNING & DEEP LEARNING
  // ─────────────────────────────────────────────────────────────
  {
    id: 'ml-mastery',
    title: 'Machine Learning & Deep Learning',
    icon: 'BrainCircuit',
    sections: [
      {
        id: 'ml-fundamentals',
        title: '1. ML Fundamentals',
        topics: [
          { id: 'ml-intro', title: 'What is Machine Learning?' },
          { id: 'ml-supervised', title: 'Supervised Learning' },
          { id: 'ml-unsupervised', title: 'Unsupervised Learning' },
          { id: 'ml-reinforcement', title: 'Reinforcement Learning' },
          { id: 'ml-linear-regression', title: 'Linear Regression' },
          { id: 'ml-logistic-regression', title: 'Logistic Regression' },
          { id: 'ml-decision-trees', title: 'Decision Trees & Random Forests' },
          { id: 'ml-svm', title: 'Support Vector Machines (SVM)' },
          { id: 'ml-knn', title: 'K-Nearest Neighbors (KNN)' },
          { id: 'ml-clustering', title: 'K-Means & DBSCAN Clustering' },
          { id: 'ml-evaluation', title: 'Model Evaluation (Precision, Recall, F1, AUC-ROC)' },
          { id: 'ml-cross-validation', title: 'Cross-Validation & Overfitting' },
        ]
      },
      {
        id: 'ml-deep-learning',
        title: '2. Deep Learning',
        topics: [
          { id: 'dl-neural-networks', title: 'Neural Networks Fundamentals' },
          { id: 'dl-backpropagation', title: 'Backpropagation & Gradient Descent' },
          { id: 'dl-activation-functions', title: 'Activation Functions (ReLU, Sigmoid, Softmax)' },
          { id: 'dl-cnn', title: 'Convolutional Neural Networks (CNN)' },
          { id: 'dl-rnn-lstm', title: 'RNN & LSTM — Sequential Data' },
          { id: 'dl-transformers', title: 'Transformer Architecture' },
          { id: 'dl-attention', title: 'Attention Mechanism & Self-Attention' },
          { id: 'dl-bert-gpt', title: 'BERT vs GPT — Encoder vs Decoder' },
          { id: 'dl-fine-tuning', title: 'Fine-tuning Pre-trained Models' },
          { id: 'dl-lora-qlora', title: 'LoRA & QLoRA — Efficient Fine-tuning' },
        ]
      },
      {
        id: 'ml-tools',
        title: '3. ML Tools & Frameworks',
        topics: [
          { id: 'ml-numpy', title: 'NumPy — Numerical Computing' },
          { id: 'ml-pandas', title: 'Pandas — Data Manipulation' },
          { id: 'ml-matplotlib', title: 'Matplotlib & Seaborn — Visualization' },
          { id: 'ml-sklearn', title: 'Scikit-learn — Classical ML' },
          { id: 'ml-pytorch', title: 'PyTorch Fundamentals' },
          { id: 'ml-tensorflow', title: 'TensorFlow & Keras' },
          { id: 'ml-huggingface', title: 'Hugging Face Transformers' },
          { id: 'ml-mlflow', title: 'MLflow — Experiment Tracking' },
        ]
      },
      {
        id: 'ml-quizzes',
        title: 'Quizzes',
        topics: [
          { id: 'ml-quiz-beginner', title: 'Beginner Quiz (50 Questions)' },
          { id: 'ml-quiz-intermediate', title: 'Intermediate Quiz (50 Questions)' },
          { id: 'ml-quiz-advanced', title: 'Advanced Quiz (50 Questions)' },
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  //  NEXT.JS MASTERY
  // ─────────────────────────────────────────────────────────────
  {
    id: 'nextjs-mastery',
    title: 'Next.js Mastery',
    icon: 'Code2',
    sections: [
      {
        id: 'next-basics',
        title: '1. Next.js Fundamentals',
        topics: [
          { id: 'next-intro', title: 'What is Next.js? (vs React)' },
          { id: 'next-setup', title: 'Creating a Next.js App (create-next-app)' },
          { id: 'next-app-router', title: 'App Router vs Pages Router' },
          { id: 'next-file-routing', title: 'File-based Routing' },
          { id: 'next-layouts', title: 'Layouts & Nested Layouts' },
          { id: 'next-link', title: 'Link Component & Navigation' },
          { id: 'next-image', title: 'Image Optimization (next/image)' },
          { id: 'next-fonts', title: 'Font Optimization (next/font)' },
          { id: 'next-metadata', title: 'SEO & Metadata API' },
        ]
      },
      {
        id: 'next-rendering',
        title: '2. Rendering Strategies',
        topics: [
          { id: 'next-server-components', title: 'React Server Components (RSC)' },
          { id: 'next-client-components', title: 'Client Components ("use client")' },
          { id: 'next-ssr', title: 'Server-Side Rendering (SSR)' },
          { id: 'next-ssg', title: 'Static Site Generation (SSG)' },
          { id: 'next-isr', title: 'Incremental Static Regeneration (ISR)' },
          { id: 'next-streaming', title: 'Streaming & Suspense' },
          { id: 'next-ppr', title: 'Partial Pre-Rendering (PPR)' },
        ]
      },
      {
        id: 'next-data',
        title: '3. Data Fetching & APIs',
        topics: [
          { id: 'next-fetch', title: 'fetch() in Server Components' },
          { id: 'next-server-actions', title: 'Server Actions (Form Mutations)' },
          { id: 'next-route-handlers', title: 'Route Handlers (API Routes)' },
          { id: 'next-middleware', title: 'Middleware' },
          { id: 'next-cookies-headers', title: 'Cookies & Headers' },
          { id: 'next-loading-states', title: 'loading.tsx & error.tsx' },
        ]
      },
      {
        id: 'next-advanced',
        title: '4. Advanced Next.js',
        topics: [
          { id: 'next-auth', title: 'Authentication (NextAuth.js / Clerk)' },
          { id: 'next-prisma', title: 'Database with Prisma ORM' },
          { id: 'next-trpc', title: 'tRPC — End-to-End Type Safety' },
          { id: 'next-zustand', title: 'State Management (Zustand)' },
          { id: 'next-deployment', title: 'Deployment on Vercel' },
          { id: 'next-performance', title: 'Performance Optimization' },
          { id: 'next-interview', title: 'Next.js Interview Questions' },
        ]
      },
      {
        id: 'next-quizzes',
        title: 'Quizzes',
        topics: [
          { id: 'next-quiz-beginner', title: 'Beginner Quiz (50 Questions)' },
          { id: 'next-quiz-advanced', title: 'Advanced Quiz (50 Questions)' },
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  //  VUE.JS MASTERY
  // ─────────────────────────────────────────────────────────────
  {
    id: 'vue-mastery',
    title: 'Vue.js Mastery',
    icon: 'LayoutTemplate',
    sections: [
      {
        id: 'vue-basics',
        title: '1. Vue.js Fundamentals',
        topics: [
          { id: 'vue-intro', title: 'What is Vue.js?' },
          { id: 'vue-setup', title: 'Setting Up Vue 3 (Vite)' },
          { id: 'vue-template-syntax', title: 'Template Syntax & Directives' },
          { id: 'vue-reactivity', title: 'Reactivity (ref, reactive)' },
          { id: 'vue-computed', title: 'Computed Properties & Watchers' },
          { id: 'vue-components', title: 'Components & Props' },
          { id: 'vue-events', title: 'Custom Events & v-model' },
          { id: 'vue-lifecycle', title: 'Lifecycle Hooks' },
        ]
      },
      {
        id: 'vue-advanced',
        title: '2. Advanced Vue.js',
        topics: [
          { id: 'vue-composition-api', title: 'Composition API (setup())' },
          { id: 'vue-slots', title: 'Slots & Scoped Slots' },
          { id: 'vue-provide-inject', title: 'provide / inject' },
          { id: 'vue-router', title: 'Vue Router 4' },
          { id: 'vue-pinia', title: 'Pinia — State Management' },
          { id: 'vue-async', title: 'Async Components & Suspense' },
          { id: 'vue-nuxt', title: 'Nuxt.js Overview' },
          { id: 'vue-interview', title: 'Vue.js Interview Questions' },
        ]
      },
      {
        id: 'vue-quizzes',
        title: 'Quizzes',
        topics: [
          { id: 'vue-quiz-beginner', title: 'Beginner Quiz (50 Questions)' },
          { id: 'vue-quiz-advanced', title: 'Advanced Quiz (50 Questions)' },
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  //  DJANGO & FASTAPI (PYTHON WEB)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'python-web',
    title: 'Django & FastAPI',
    icon: 'Network',
    sections: [
      {
        id: 'django-basics',
        title: '1. Django Fundamentals',
        topics: [
          { id: 'django-intro', title: 'Django — MVT Architecture' },
          { id: 'django-setup', title: 'Project & App Setup' },
          { id: 'django-models', title: 'Models & ORM' },
          { id: 'django-views', title: 'Views (FBV & CBV)' },
          { id: 'django-templates', title: 'Django Templates' },
          { id: 'django-forms', title: 'Forms & Validation' },
          { id: 'django-admin', title: 'Django Admin' },
          { id: 'django-auth', title: 'Authentication & Permissions' },
          { id: 'django-rest', title: 'Django REST Framework (DRF)' },
        ]
      },
      {
        id: 'fastapi-basics',
        title: '2. FastAPI',
        topics: [
          { id: 'fastapi-intro', title: 'FastAPI — Why & When' },
          { id: 'fastapi-setup', title: 'Setup & First Endpoint' },
          { id: 'fastapi-routing', title: 'Path Parameters & Query Params' },
          { id: 'fastapi-pydantic', title: 'Pydantic Models & Validation' },
          { id: 'fastapi-async', title: 'Async Routes & Background Tasks' },
          { id: 'fastapi-auth', title: 'JWT Authentication (OAuth2)' },
          { id: 'fastapi-sqlalchemy', title: 'SQLAlchemy Integration' },
          { id: 'fastapi-websockets', title: 'WebSockets in FastAPI' },
          { id: 'fastapi-deployment', title: 'Deploying FastAPI (Docker, Railway)' },
        ]
      },
      {
        id: 'python-web-quizzes',
        title: 'Quizzes',
        topics: [
          { id: 'django-quiz', title: 'Django Quiz (50 Questions)' },
          { id: 'fastapi-quiz', title: 'FastAPI Quiz (50 Questions)' },
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  //  FLUTTER & DART
  // ─────────────────────────────────────────────────────────────
  {
    id: 'flutter-mastery',
    title: 'Flutter & Dart',
    icon: 'Cpu',
    sections: [
      {
        id: 'dart-basics',
        title: '1. Dart Language',
        topics: [
          { id: 'dart-intro', title: 'Introduction to Dart' },
          { id: 'dart-variables', title: 'Variables, Types & Null Safety' },
          { id: 'dart-functions', title: 'Functions & Arrow Syntax' },
          { id: 'dart-oop', title: 'OOP in Dart (Classes, Mixins)' },
          { id: 'dart-async', title: 'async/await & Futures' },
          { id: 'dart-streams', title: 'Streams in Dart' },
        ]
      },
      {
        id: 'flutter-basics',
        title: '2. Flutter Fundamentals',
        topics: [
          { id: 'flutter-intro', title: 'What is Flutter?' },
          { id: 'flutter-setup', title: 'Setup & First App' },
          { id: 'flutter-widgets', title: 'Widgets (Stateless & Stateful)' },
          { id: 'flutter-layout', title: 'Layout Widgets (Row, Column, Stack)' },
          { id: 'flutter-navigation', title: 'Navigation & Routing' },
          { id: 'flutter-http', title: 'HTTP & API Integration' },
          { id: 'flutter-state', title: 'State Management (Provider, Riverpod, Bloc)' },
          { id: 'flutter-animations', title: 'Animations' },
          { id: 'flutter-deployment', title: 'Publishing to Play Store & App Store' },
        ]
      },
      {
        id: 'flutter-quizzes',
        title: 'Quizzes',
        topics: [
          { id: 'flutter-quiz-beginner', title: 'Beginner Quiz (50 Questions)' },
          { id: 'flutter-quiz-advanced', title: 'Advanced Quiz (50 Questions)' },
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  //  KOTLIN (ANDROID)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'kotlin-mastery',
    title: 'Kotlin & Android',
    icon: 'Cpu',
    sections: [
      {
        id: 'kotlin-basics',
        title: '1. Kotlin Language',
        topics: [
          { id: 'kotlin-intro', title: 'Why Kotlin? (vs Java)' },
          { id: 'kotlin-syntax', title: 'Kotlin Syntax Basics' },
          { id: 'kotlin-null-safety', title: 'Null Safety & ?:' },
          { id: 'kotlin-data-classes', title: 'Data Classes & Sealed Classes' },
          { id: 'kotlin-extension-fns', title: 'Extension Functions' },
          { id: 'kotlin-coroutines', title: 'Coroutines & Flows' },
          { id: 'kotlin-dsl', title: 'Kotlin DSL' },
        ]
      },
      {
        id: 'android-basics',
        title: '2. Android Development',
        topics: [
          { id: 'android-intro', title: 'Android Architecture & Components' },
          { id: 'android-compose', title: 'Jetpack Compose — Modern UI' },
          { id: 'android-viewmodel', title: 'ViewModel & LiveData' },
          { id: 'android-room', title: 'Room Database' },
          { id: 'android-navigation', title: 'Navigation Component' },
          { id: 'android-retrofit', title: 'Retrofit — REST APIs' },
          { id: 'android-hilt', title: 'Hilt — Dependency Injection' },
          { id: 'android-deployment', title: 'Publishing to Play Store' },
        ]
      },
      {
        id: 'kotlin-quizzes',
        title: 'Quizzes',
        topics: [
          { id: 'kotlin-quiz-beginner', title: 'Beginner Quiz (50 Questions)' },
          { id: 'kotlin-quiz-advanced', title: 'Advanced Quiz (50 Questions)' },
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  //  C# & .NET
  // ─────────────────────────────────────────────────────────────
  {
    id: 'csharp-mastery',
    title: 'C# & .NET',
    icon: 'Code2',
    sections: [
      {
        id: 'csharp-basics',
        title: '1. C# Fundamentals',
        topics: [
          { id: 'cs-intro', title: 'C# Introduction & .NET Ecosystem' },
          { id: 'cs-types', title: 'Value Types vs Reference Types' },
          { id: 'cs-classes', title: 'Classes, Structs & Records' },
          { id: 'cs-oop', title: 'OOP — Inheritance, Polymorphism, Interfaces' },
          { id: 'cs-generics', title: 'Generics & Collections' },
          { id: 'cs-linq', title: 'LINQ — Language Integrated Query' },
          { id: 'cs-async', title: 'async/await & Task Parallel Library' },
          { id: 'cs-exceptions', title: 'Exception Handling & Patterns' },
        ]
      },
      {
        id: 'dotnet-web',
        title: '2. ASP.NET Core',
        topics: [
          { id: 'aspnet-intro', title: 'ASP.NET Core Overview' },
          { id: 'aspnet-minimal-api', title: 'Minimal APIs' },
          { id: 'aspnet-controllers', title: 'Controllers & Routing' },
          { id: 'aspnet-ef-core', title: 'Entity Framework Core (ORM)' },
          { id: 'aspnet-auth', title: 'Authentication & Authorization (JWT)' },
          { id: 'aspnet-signalr', title: 'SignalR — Real-time Communication' },
          { id: 'aspnet-deployment', title: 'Deploying .NET Apps (Azure, Docker)' },
        ]
      },
      {
        id: 'csharp-quizzes',
        title: 'Quizzes',
        topics: [
          { id: 'cs-quiz-beginner', title: 'Beginner Quiz (50 Questions)' },
          { id: 'cs-quiz-advanced', title: 'Advanced Quiz (50 Questions)' },
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  //  CYBERSECURITY
  // ─────────────────────────────────────────────────────────────
  {
    id: 'cybersecurity',
    title: 'Cybersecurity',
    icon: 'Network',
    sections: [
      {
        id: 'cyber-fundamentals',
        title: '1. Security Fundamentals',
        topics: [
          { id: 'cyber-intro', title: 'What is Cybersecurity?' },
          { id: 'cyber-cia-triad', title: 'CIA Triad (Confidentiality, Integrity, Availability)' },
          { id: 'cyber-threats', title: 'Types of Threats & Attackers' },
          { id: 'cyber-encryption', title: 'Cryptography & Encryption (AES, RSA)' },
          { id: 'cyber-hashing', title: 'Hashing (SHA, bcrypt, Argon2)' },
          { id: 'cyber-tls', title: 'TLS/SSL & HTTPS' },
          { id: 'cyber-pki', title: 'PKI & Certificates' },
          { id: 'cyber-network-security', title: 'Network Security (Firewall, IDS/IPS)' },
        ]
      },
      {
        id: 'cyber-web-security',
        title: '2. Web Application Security',
        topics: [
          { id: 'cyber-owasp', title: 'OWASP Top 10' },
          { id: 'cyber-sqli', title: 'SQL Injection' },
          { id: 'cyber-xss', title: 'Cross-Site Scripting (XSS)' },
          { id: 'cyber-csrf', title: 'CSRF — Cross-Site Request Forgery' },
          { id: 'cyber-idor', title: 'IDOR & Access Control Issues' },
          { id: 'cyber-ssrf', title: 'SSRF & XXE Attacks' },
          { id: 'cyber-jwt-security', title: 'JWT Security Pitfalls' },
          { id: 'cyber-secure-coding', title: 'Secure Coding Practices' },
        ]
      },
      {
        id: 'cyber-pentesting',
        title: '3. Penetration Testing',
        topics: [
          { id: 'cyber-recon', title: 'Reconnaissance & OSINT' },
          { id: 'cyber-nmap', title: 'nmap — Port Scanning' },
          { id: 'cyber-burpsuite', title: 'Burp Suite for Web Pentesting' },
          { id: 'cyber-metasploit', title: 'Metasploit Framework Overview' },
          { id: 'cyber-ctf', title: 'CTF Challenges & Practice Platforms' },
          { id: 'cyber-report', title: 'Writing Pentest Reports' },
        ]
      },
      {
        id: 'cyber-quizzes',
        title: 'Quizzes',
        topics: [
          { id: 'cyber-quiz-beginner', title: 'Beginner Quiz (50 Questions)' },
          { id: 'cyber-quiz-advanced', title: 'Advanced Quiz (50 Questions)' },
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  //  DEVOPS & CI/CD
  // ─────────────────────────────────────────────────────────────
  {
    id: 'devops-mastery',
    title: 'DevOps & CI/CD',
    icon: 'Box',
    sections: [
      {
        id: 'devops-basics',
        title: '1. DevOps Fundamentals',
        topics: [
          { id: 'devops-intro', title: 'What is DevOps? Culture & Principles' },
          { id: 'devops-sdlc', title: 'DevOps SDLC & Automation' },
          { id: 'devops-git-flow', title: 'Git Branching Strategies' },
          { id: 'devops-ci', title: 'Continuous Integration (CI)' },
          { id: 'devops-cd', title: 'Continuous Delivery & Deployment (CD)' },
          { id: 'devops-infra-as-code', title: 'Infrastructure as Code (IaC)' },
          { id: 'devops-monitoring', title: 'Monitoring & Observability' },
        ]
      },
      {
        id: 'devops-tools',
        title: '2. Tools & Platforms',
        topics: [
          { id: 'devops-github-actions', title: 'GitHub Actions — CI/CD Pipelines' },
          { id: 'devops-jenkins', title: 'Jenkins — Automation Server' },
          { id: 'devops-gitlab-ci', title: 'GitLab CI/CD' },
          { id: 'devops-terraform', title: 'Terraform — Infrastructure Provisioning' },
          { id: 'devops-ansible', title: 'Ansible — Configuration Management' },
          { id: 'devops-k8s', title: 'Kubernetes — Container Orchestration' },
          { id: 'devops-helm', title: 'Helm — K8s Package Manager' },
          { id: 'devops-prometheus', title: 'Prometheus & Grafana — Monitoring Stack' },
        ]
      },
      {
        id: 'devops-quizzes',
        title: 'Quizzes',
        topics: [
          { id: 'devops-quiz-beginner', title: 'Beginner Quiz (50 Questions)' },
          { id: 'devops-quiz-advanced', title: 'Advanced Quiz (50 Questions)' },
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  //  BLOCKCHAIN & WEB3
  // ─────────────────────────────────────────────────────────────
  {
    id: 'blockchain-mastery',
    title: 'Blockchain & Web3',
    icon: 'Network',
    sections: [
      {
        id: 'blockchain-basics',
        title: '1. Blockchain Fundamentals',
        topics: [
          { id: 'blockchain-intro', title: 'What is Blockchain?' },
          { id: 'blockchain-consensus', title: 'Consensus Mechanisms (PoW, PoS)' },
          { id: 'blockchain-bitcoin', title: 'Bitcoin & UTXO Model' },
          { id: 'blockchain-ethereum', title: 'Ethereum & EVM' },
          { id: 'blockchain-wallets', title: 'Wallets, Keys & Addresses' },
          { id: 'blockchain-defi', title: 'DeFi — Decentralized Finance Overview' },
          { id: 'blockchain-nft', title: 'NFTs & Token Standards (ERC-20, ERC-721)' },
        ]
      },
      {
        id: 'blockchain-solidity',
        title: '2. Solidity & Smart Contracts',
        topics: [
          { id: 'solidity-intro', title: 'Solidity Language Basics' },
          { id: 'solidity-data-types', title: 'Data Types & Storage' },
          { id: 'solidity-functions', title: 'Functions, Modifiers & Events' },
          { id: 'solidity-security', title: 'Smart Contract Security (Reentrancy, Overflow)' },
          { id: 'solidity-hardhat', title: 'Hardhat — Development Environment' },
          { id: 'solidity-ethers', title: 'ethers.js — Frontend Integration' },
          { id: 'solidity-deployment', title: 'Deploying to Testnets & Mainnet' },
        ]
      },
      {
        id: 'blockchain-quizzes',
        title: 'Quizzes',
        topics: [
          { id: 'blockchain-quiz-beginner', title: 'Beginner Quiz (50 Questions)' },
          { id: 'blockchain-quiz-advanced', title: 'Advanced Quiz (50 Questions)' },
        ]
      }
    ]
  },

];
