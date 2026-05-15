import { javaOfflineCatalog } from './generated/javaOfflineCatalog';
import type { ScrapedSection } from './generated/javaScrapedContent';

// Lazy-loaded: only bundled when first Java offline topic is requested
let _scrapedModule: typeof import('./generated/javaScrapedContent') | null = null;
async function loadScrapedContent() {
  if (!_scrapedModule) {
    _scrapedModule = await import('./generated/javaScrapedContent');
  }
  return _scrapedModule;
}
function getScrapedTopic(topicId: string) {
  // Sync lookup from already-loaded module (called after preload)
  return _scrapedModule ? _scrapedModule.getScrapedTopic(topicId) : null;
}

// Preload scraped content when Java module topics are about to be rendered
export async function preloadJavaScrapedContent() {
  await loadScrapedContent();
}

type Difficulty = 'beginner' | 'standard' | 'expert';
type JavaGroup =
  | 'basics'
  | 'oops'
  | 'arrays'
  | 'strings'
  | 'exceptions'
  | 'concurrency'
  | 'io'
  | 'collections'
  | 'jdbc'
  | 'memory'
  | 'networking'
  | 'quizzes'
  | 'core';

type TopicLike = {
  id?: string;
  title?: string;
  moduleTitle?: string;
  sectionTitle?: string;
};

type JavaOfflineLessonInput = {
  topic: TopicLike;
  language: string;
  difficulty: Difficulty;
  reason?: string;
};

type ComparisonRow = [aspect: string, left: string, right: string];

type JavaTopicProfile = {
  definition: string;
  mentalModel: string;
  why: string[];
  core: string[];
  syntax?: string[];
  workflow: string[];
  example: string;
  walkthrough: string[];
  mistakes: string[];
  bestPractices: string[];
  debugging: string[];
  interview: string[];
  practice: string[];
  comparison?: ComparisonRow[];
};

const HINGLISH_RE = /hinglish|roman|urdu|hindi/i;

export function isJavaOfflineTopic(topic: TopicLike | null | undefined) {
  return Boolean(topic?.moduleTitle?.toLowerCase().includes('java') || topic?.id?.toLowerCase().includes('java'));
}

function isHinglish(language: string) {
  return HINGLISH_RE.test(language);
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\b(java|in|the|a|an|with|and|of|class|keyword|method|interface)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeJavaString(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function findCatalogTopic(topic: TopicLike) {
  const title = normalize(topic.title || '');
  const id = topic.id || '';

  for (const section of javaOfflineCatalog.sections) {
    const exact = section.topics.find(item => item.id === id || normalize(item.title) === title);
    if (exact) return { section, topic: exact };
  }

  for (const section of javaOfflineCatalog.sections) {
    const fuzzy = section.topics.find(item => {
      const current = normalize(item.title);
      return title && (current.includes(title) || title.includes(current));
    });
    if (fuzzy) return { section, topic: fuzzy };
  }

  return null;
}

function javaGroup(topicId: string, title: string): JavaGroup {
  const lower = `${topicId} ${title}`.toLowerCase();
  if (/quiz/.test(lower)) return 'quizzes';
  if (/thread|synchron|deadlock|daemon|volatile|monitor|executor|shutdownhook|multitask/.test(lower)) return 'concurrency';
  if (/collection|arraylist|linkedlist|hash|map|set|queue|deque|comparator|comparable|sort|search|structure|list/.test(lower)) return 'collections';
  if (/jdbc|database|sql|connection|statement|resultset|transaction|batch|driver/.test(lower)) return 'jdbc';
  if (/exception|try|catch|throw|throws|finally|finalize/.test(lower)) return 'exceptions';
  if (/string|regex|tokenizer|immutable/.test(lower)) return 'strings';
  if (/array|jagged/.test(lower)) return 'arrays';
  if (/file|input|output|stream|reader|writer|serialization|transient/.test(lower)) return 'io';
  if (/socket|network/.test(lower)) return 'networking';
  if (/memory|heap|stack|garbage|runtime|leak/.test(lower)) return 'memory';
  if (/inheritance|polymorphism|overload|override|abstract|interface|encapsulation|object|class|constructor|static|this|super|final|package|modifier|binding|instanceof|aggregation/.test(lower)) return 'oops';
  if (/loop|if|switch|break|continue|operator|variable|data type|keyword|unicode|identifier|hello|jdk|jre|jvm|path|program|comment|what|history|feature|overview|syntax|environment|tutorial|cpp/.test(lower)) return 'basics';
  return 'core';
}

function buildBaseProfile(group: JavaGroup, title: string): JavaTopicProfile {
  const safeTitle = escapeJavaString(title);

  const common: JavaTopicProfile = {
    definition: `${title} is a Java topic that should be learned through definition, syntax, runnable practice, and debugging instead of memorization only.`,
    mentalModel: `Treat ${title} as one small lever in the Java runtime: write a tiny program, run it, change one thing, then observe what changed.`,
    why: [
      'It appears in real Java code, interviews, debugging sessions, and framework usage.',
      'It builds vocabulary for reading documentation and understanding compiler/runtime messages.',
      'It connects beginner syntax with practical engineering decisions.',
    ],
    core: [
      'Start from the exact meaning of the topic.',
      'Learn the rules Java enforces at compile time.',
      'Run a minimal example before moving to large code.',
      'Connect the concept to neighboring topics in the same section.',
    ],
    workflow: [
      'Create a small Main.java file.',
      'Add the minimum code that demonstrates the topic.',
      'Compile with javac Main.java.',
      'Run with java Main.',
      'Change one input or line and observe the behavior.',
    ],
    example: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Learning ${safeTitle}");\n    }\n}`,
    walkthrough: [
      'public class Main defines the class that contains the program entry point.',
      'main(String[] args) is where execution starts.',
      'System.out.println prints a visible result so you can confirm the program ran.',
    ],
    mistakes: [
      'Reading the concept once without writing code.',
      'Ignoring Java capitalization rules.',
      'Skipping compiler errors instead of reading the first useful line.',
    ],
    bestPractices: [
      'Keep examples small until the concept is clear.',
      'Use meaningful names even in practice code.',
      'Write down the rule, one example, and one counter-example.',
    ],
    debugging: [
      'If compilation fails, check spelling, file name, braces, semicolons, and class name first.',
      'If output is unexpected, print intermediate values and reduce the code to the smallest failing case.',
    ],
    interview: [
      `What is ${title} in Java?`,
      `Why does ${title} matter in real code?`,
      `What is one common mistake with ${title}?`,
    ],
    practice: [
      `Explain ${title} in five lines.`,
      'Write a tiny Java program that demonstrates it.',
      'Create one wrong version, read the error, and fix it.',
    ],
  };

  const groupProfiles: Record<JavaGroup, JavaTopicProfile> = {
    basics: {
      ...common,
      definition: `${title} belongs to Java fundamentals: syntax, program structure, data, control flow, or the Java toolchain.`,
      mentalModel: 'Java fundamentals are like grammar for a language: small rules look simple, but every later topic depends on them.',
      core: [
        'Java code is written in .java files and compiled into bytecode.',
        'The compiler checks syntax and many type mistakes before the program runs.',
        'The JVM executes bytecode and provides portability across operating systems.',
        'Small syntax rules such as braces, semicolons, and capitalization matter.',
      ],
    },
    oops: {
      ...common,
      definition: `${title} is part of object-oriented programming in Java, where code is organized around classes, objects, state, and behavior.`,
      mentalModel: 'Think of a class as a blueprint, an object as a built instance, fields as state, and methods as behavior.',
      core: [
        'Classes group related data and behavior.',
        'Objects hold actual runtime state.',
        'Encapsulation protects data behind methods.',
        'Inheritance and polymorphism should model real substitutability, not just reuse.',
      ],
      example: `class BankAccount {\n    private int balance;\n\n    BankAccount(int openingBalance) {\n        this.balance = openingBalance;\n    }\n\n    void deposit(int amount) {\n        if (amount <= 0) {\n            throw new IllegalArgumentException("amount must be positive");\n        }\n        balance += amount;\n    }\n\n    int getBalance() {\n        return balance;\n    }\n}\n\npublic class Main {\n    public static void main(String[] args) {\n        BankAccount account = new BankAccount(100);\n        account.deposit(50);\n        System.out.println(account.getBalance());\n    }\n}`,
      walkthrough: [
        'BankAccount groups state and behavior in one class.',
        'balance is private, so outside code cannot change it directly.',
        'deposit validates input before mutating state.',
        'getBalance exposes a safe read operation.',
      ],
    },
    arrays: {
      ...common,
      definition: `${title} is about storing multiple values in indexed containers.`,
      mentalModel: 'An array is a fixed-size row of boxes. Every box has an index, starting at 0.',
      core: [
        'Array indexes start at 0.',
        'Array length is fixed after creation.',
        'Access is fast by index, but resizing requires a new array or a collection.',
        'Multidimensional arrays are arrays whose elements are also arrays.',
      ],
      example: `public class Main {\n    public static void main(String[] args) {\n        int[] scores = {90, 75, 88};\n        int total = 0;\n        for (int score : scores) {\n            total += score;\n        }\n        System.out.println("Average = " + (total / scores.length));\n    }\n}`,
      walkthrough: [
        'int[] scores creates an array of integers.',
        'The enhanced for loop visits each value.',
        'scores.length gives the number of elements.',
      ],
    },
    strings: {
      ...common,
      definition: `${title} is about text handling in Java, especially String immutability and text manipulation APIs.`,
      mentalModel: 'A String value is immutable. Operations like concat or replace create a new text value instead of changing the old one.',
      core: [
        'String stores text and is immutable.',
        'Use equals() for content comparison.',
        'Use StringBuilder for repeated modification in loops.',
        'Understand null handling before calling methods on a String reference.',
      ],
      example: `public class Main {\n    public static void main(String[] args) {\n        String name = "Java";\n        String upper = name.toUpperCase();\n        System.out.println(name);\n        System.out.println(upper);\n        System.out.println(name.equals("Java"));\n    }\n}`,
      walkthrough: [
        'name points to the original String.',
        'toUpperCase creates another String.',
        'equals compares text content.',
      ],
    },
    exceptions: {
      ...common,
      definition: `${title} is part of Java exception handling: the mechanism for reporting and recovering from abnormal program situations.`,
      mentalModel: 'An exception is a signal that normal flow cannot continue safely at this point.',
      core: [
        'try contains code that may fail.',
        'catch handles a specific failure type.',
        'finally runs cleanup code regardless of success or failure.',
        'Checked exceptions are part of the method contract; unchecked exceptions usually indicate programming mistakes or invalid state.',
      ],
      example: `public class Main {\n    static int divide(int a, int b) {\n        if (b == 0) {\n            throw new IllegalArgumentException("b cannot be zero");\n        }\n        return a / b;\n    }\n\n    public static void main(String[] args) {\n        try {\n            System.out.println(divide(10, 0));\n        } catch (IllegalArgumentException ex) {\n            System.out.println("Invalid input: " + ex.getMessage());\n        }\n    }\n}`,
      walkthrough: [
        'divide rejects invalid input before doing unsafe work.',
        'throw creates an exception and stops normal flow.',
        'catch handles that specific exception type.',
      ],
    },
    concurrency: {
      ...common,
      definition: `${title} belongs to Java concurrency: running tasks in parallel or interleaving them safely.`,
      mentalModel: 'Concurrency is multiple flows touching time and shared state. The hard part is not starting threads; the hard part is keeping data correct.',
      core: [
        'A Thread represents an independent path of execution.',
        'Shared mutable data can create race conditions.',
        'synchronized and locks control access to critical sections.',
        'High-level utilities such as ExecutorService are usually safer than manual thread management.',
      ],
      example: `public class Main {\n    public static void main(String[] args) throws InterruptedException {\n        Thread worker = new Thread(() -> {\n            System.out.println("Running on " + Thread.currentThread().getName());\n        });\n        worker.start();\n        worker.join();\n        System.out.println("Done");\n    }\n}`,
      walkthrough: [
        'new Thread creates a task with its own execution path.',
        'start launches the thread; calling run directly would not start a new thread.',
        'join waits for the worker to finish.',
      ],
    },
    io: {
      ...common,
      definition: `${title} is about reading from or writing to files, streams, and external resources.`,
      mentalModel: 'I/O is a pipe between your program and something outside it. You must choose the right pipe and close it correctly.',
      core: [
        'Byte streams handle binary data.',
        'Character streams handle text data.',
        'Buffered streams improve performance for repeated reads/writes.',
        'try-with-resources closes files and streams reliably.',
      ],
      example: `import java.io.IOException;\nimport java.nio.file.Files;\nimport java.nio.file.Path;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        Path path = Path.of("notes.txt");\n        Files.writeString(path, "Learning Java I/O");\n        String text = Files.readString(path);\n        System.out.println(text);\n    }\n}`,
      walkthrough: [
        'Path represents a file location.',
        'Files.writeString writes text to the file.',
        'Files.readString reads the full text back.',
      ],
    },
    collections: {
      ...common,
      definition: `${title} is part of the Java Collections Framework: reusable data structures for storing and organizing objects.`,
      mentalModel: 'A collection is a container. Pick it by access pattern: ordered list, unique set, key-value map, or queue.',
      core: [
        'List keeps ordered elements and allows duplicates.',
        'Set keeps unique elements.',
        'Map stores key-value pairs.',
        'Performance depends on implementation: ArrayList, LinkedList, HashMap, TreeMap, and others have different costs.',
      ],
      example: `import java.util.ArrayList;\nimport java.util.List;\n\npublic class Main {\n    public static void main(String[] args) {\n        List<String> topics = new ArrayList<>();\n        topics.add("Java");\n        topics.add("${safeTitle}");\n        for (String topic : topics) {\n            System.out.println(topic);\n        }\n    }\n}`,
      walkthrough: [
        'List is the interface type, which keeps code flexible.',
        'ArrayList is the concrete implementation.',
        'The loop reads items in insertion order.',
      ],
    },
    jdbc: {
      ...common,
      definition: `${title} belongs to JDBC, Java's standard API for connecting to relational databases.`,
      mentalModel: 'JDBC is a bridge: Java code sends SQL through a driver, the database executes it, and Java reads results back.',
      core: [
        'DriverManager or a DataSource creates database connections.',
        'PreparedStatement safely sends SQL with parameters.',
        'ResultSet reads query results row by row.',
        'Transactions group multiple database changes into one commit or rollback unit.',
      ],
      example: `String sql = "SELECT id, name FROM users WHERE email = ?";\n// try (PreparedStatement ps = connection.prepareStatement(sql)) {\n//     ps.setString(1, email);\n//     try (ResultSet rs = ps.executeQuery()) {\n//         while (rs.next()) {\n//             System.out.println(rs.getInt("id") + ": " + rs.getString("name"));\n//         }\n//     }\n// }`,
      walkthrough: [
        'The ? placeholder keeps user input separate from SQL text.',
        'setString binds the parameter safely.',
        'executeQuery returns a ResultSet for SELECT statements.',
      ],
    },
    memory: {
      ...common,
      definition: `${title} is about how Java uses memory, manages objects, and cleans unused data.`,
      mentalModel: 'The stack tracks method calls and local references; the heap stores objects that live beyond one line of code.',
      core: [
        'Local variables and method frames live on the stack.',
        'Objects are allocated on the heap.',
        'Garbage collection frees objects that are no longer reachable.',
        'Memory leaks in Java usually happen when references are kept longer than needed.',
      ],
      example: `import java.util.ArrayList;\nimport java.util.List;\n\npublic class Main {\n    public static void main(String[] args) {\n        List<byte[]> cache = new ArrayList<>();\n        cache.add(new byte[1024]);\n        System.out.println("Objects stay alive while references remain reachable.");\n    }\n}`,
      walkthrough: [
        'cache is a local reference.',
        'new byte[1024] allocates an object on the heap.',
        'The object remains reachable while cache references it.',
      ],
    },
    networking: {
      ...common,
      definition: `${title} is about communication between Java programs and external systems over a network.`,
      mentalModel: 'Networking is request and response over addresses and ports. Java wraps low-level sockets in APIs.',
      core: [
        'A socket connects a program to an IP address and port.',
        'Servers listen; clients connect.',
        'Network code must handle timeouts, partial failures, and malformed data.',
        'Modern apps often use HTTP clients and frameworks over raw sockets.',
      ],
      example: `import java.net.URI;\nimport java.net.http.HttpClient;\nimport java.net.http.HttpRequest;\nimport java.net.http.HttpResponse;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        HttpClient client = HttpClient.newHttpClient();\n        HttpRequest request = HttpRequest.newBuilder(URI.create("https://example.com")).build();\n        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());\n        System.out.println(response.statusCode());\n    }\n}`,
      walkthrough: [
        'HttpClient sends HTTP requests.',
        'HttpRequest describes the target URI and request options.',
        'HttpResponse contains the status code and response body.',
      ],
    },
    quizzes: {
      ...common,
      definition: `${title} checks whether the learner can apply Java concepts instead of only recognizing definitions.`,
      mentalModel: 'A quiz is a diagnostic tool: wrong answers show exactly what to revise next.',
      core: [
        'Mix definition, code reading, debugging, and scenario questions.',
        'Explain why the correct answer is correct.',
        'Use wrong options that represent common beginner mistakes.',
      ],
    },
    core: common,
  };

  const groupEnhancements: Record<JavaGroup, Partial<JavaTopicProfile>> = {
    basics: {
      workflow: [
        'Read the exact syntax rule for the topic.',
        'Write the smallest possible Java example.',
        'Compile it and fix syntax/type errors first.',
        'Change one value or branch condition.',
        'Explain the output before checking the console.',
      ],
      mistakes: [
        'Mixing Java syntax with JavaScript, C++, or Python habits.',
        'Ignoring case sensitivity in class names, method names, and keywords.',
        'Forgetting semicolons, braces, or the public class/file-name rule.',
        'Trying to learn control flow without dry-running values line by line.',
      ],
      bestPractices: [
        'Prefer clear variable names over one-letter names except loop counters.',
        'Keep one beginner concept per small program.',
        'Use parentheses when operator precedence could confuse a reader.',
        'Write expected output before running the program.',
      ],
      debugging: [
        'For compile errors, check the first error before reading the rest.',
        'For wrong output, print the changing variables inside the loop or branch.',
        'For command issues, verify javac -version and java -version.',
      ],
      interview: [
        `Define ${title} in Java.`,
        'Show a tiny code example and explain the output.',
        'What mistake would cause a compile-time error here?',
        'How does this topic connect to the JVM, type system, or control flow?',
      ],
      practice: [
        `Write one valid and one invalid example for ${title}.`,
        'Dry-run the valid example line by line.',
        'Modify the example to handle one extra case.',
      ],
    },
    oops: {
      workflow: [
        'Identify the responsibility of the class or object.',
        'Decide which state must be private.',
        'Expose behavior through small methods.',
        'Write a main method that creates at least two objects.',
        'Check whether inheritance or composition is the better design.',
      ],
      mistakes: [
        'Using inheritance only to reuse code when composition would be clearer.',
        'Making fields public and losing control over object validity.',
        'Confusing overloading with overriding.',
        'Forgetting that polymorphism dispatches overridden instance methods at runtime.',
      ],
      bestPractices: [
        'Keep fields private unless there is a strong reason.',
        'Use @Override when overriding methods.',
        'Name classes as nouns and methods as actions.',
        'Prefer small cohesive classes over large all-purpose classes.',
      ],
      debugging: [
        'If a method is not overriding, check name, parameters, access modifier, and return type.',
        'If object state is wrong, inspect constructor values and every mutating method.',
        'If polymorphic output surprises you, print object.getClass().getName().',
      ],
      interview: [
        `What is ${title} in OOP?`,
        'What problem does it solve in class design?',
        'Show one good use case and one misuse.',
        'How does it affect maintainability?',
      ],
      practice: [
        'Model a Student, Course, or BankAccount using this topic.',
        'Add validation so the object cannot enter an invalid state.',
        'Refactor one bad design into a cleaner OOP design.',
      ],
    },
    arrays: {
      workflow: [
        'Choose the element type and array size.',
        'Initialize the array with sample values.',
        'Access values by index and confirm indexes start at 0.',
        'Loop through the array using index or enhanced for loop.',
        'Test empty, one-item, and many-item cases.',
      ],
      mistakes: [
        'Using index <= array.length instead of index < array.length.',
        'Forgetting that array size is fixed.',
        'Assuming a jagged array has equal row lengths.',
        'Ignoring default values in newly-created arrays.',
      ],
      bestPractices: [
        'Use enhanced for loops when you do not need the index.',
        'Use collections when the size must grow frequently.',
        'Validate indexes before manual access.',
      ],
      debugging: [
        'ArrayIndexOutOfBoundsException means the index is outside 0 to length - 1.',
        'Print the index and length before the failing access.',
        'For nested arrays, print each row length separately.',
      ],
      interview: [
        'What is the difference between array length and String length()?',
        'Why are arrays fast for indexed access?',
        'When would ArrayList be better than an array?',
      ],
      practice: [
        'Find max, min, sum, and average from an int array.',
        'Reverse an array in place.',
        'Build a jagged array and print every element.',
      ],
    },
    strings: {
      workflow: [
        'Create a String with a literal.',
        'Call one method such as trim, contains, substring, or replace.',
        'Store the returned value in a new variable.',
        'Compare content using equals or equalsIgnoreCase.',
        'Use StringBuilder if many changes happen in a loop.',
      ],
      mistakes: [
        'Comparing text content with == instead of equals().',
        'Expecting a String method to mutate the original String.',
        'Calling methods on a null String reference.',
        'Building large strings in loops with repeated + concatenation.',
      ],
      bestPractices: [
        'Use equals for case-sensitive comparison.',
        'Use isEmpty or isBlank depending on whether spaces count.',
        'Use StringBuilder for repeated append operations.',
        'Normalize input before validation when appropriate.',
      ],
      debugging: [
        'Print string length when hidden spaces may be causing a bug.',
        'Check for null before calling methods on uncertain input.',
        'Log both strings and their lengths when equality fails unexpectedly.',
      ],
      interview: [
        'Why is String immutable in Java?',
        'What is the difference between == and equals for String?',
        'When should you use StringBuilder?',
      ],
      practice: [
        'Write a method that counts vowels in a String.',
        'Normalize user input by trimming and lowercasing it.',
        'Build a CSV line using StringBuilder.',
      ],
    },
    exceptions: {
      workflow: [
        'Identify the risky operation.',
        'Decide whether the caller can recover.',
        'Use try-catch where recovery or user-friendly reporting is possible.',
        'Preserve the original exception message or cause.',
        'Use finally or try-with-resources for cleanup.',
      ],
      mistakes: [
        'Catching Exception everywhere and hiding the real problem.',
        'Using exceptions for normal control flow.',
        'Ignoring checked exceptions without understanding the contract.',
        'Throwing vague messages such as "error" without context.',
      ],
      bestPractices: [
        'Catch the most specific exception you can handle.',
        'Add context when rethrowing.',
        'Prefer try-with-resources for closeable resources.',
        'Validate inputs early and fail with clear messages.',
      ],
      debugging: [
        'Read the exception type and first stack-trace line in your code.',
        'Find the root cause, not only the final wrapper exception.',
        'Reproduce with the smallest input that causes the exception.',
      ],
      interview: [
        'What is checked vs unchecked exception?',
        'What is the difference between throw and throws?',
        'Why should exceptions not be swallowed silently?',
      ],
      practice: [
        'Write a method that validates input and throws IllegalArgumentException.',
        'Handle NumberFormatException for bad user input.',
        'Rewrite file-reading code using try-with-resources.',
      ],
    },
    concurrency: {
      workflow: [
        'Define the task that should run concurrently.',
        'Identify shared mutable state.',
        'Choose Thread, Runnable, ExecutorService, or synchronization tool.',
        'Protect critical sections or remove shared state.',
        'Test with repeated runs because concurrency bugs can be timing-dependent.',
      ],
      mistakes: [
        'Calling run() instead of start() and expecting a new thread.',
        'Updating shared variables without synchronization or atomic types.',
        'Holding locks while doing slow I/O.',
        'Ignoring interruption and cancellation.',
      ],
      bestPractices: [
        'Prefer ExecutorService or higher-level utilities for real applications.',
        'Keep synchronized blocks short.',
        'Use immutable data when possible.',
        'Name threads in production systems for easier debugging.',
      ],
      debugging: [
        'Log the current thread name around suspicious code.',
        'Look for shared mutable variables accessed from multiple threads.',
        'Use thread dumps when code appears stuck.',
      ],
      interview: [
        'What is the difference between process and thread?',
        'What is a race condition?',
        'How can deadlock be prevented?',
      ],
      practice: [
        'Create two threads that print different messages.',
        'Make a counter unsafe, observe bad results, then fix it.',
        'Explain a deadlock scenario and rewrite it with ordered locks.',
      ],
    },
    io: {
      workflow: [
        'Decide whether the data is text or binary.',
        'Choose a modern API such as java.nio.file.Files when possible.',
        'Use try-with-resources for streams/readers/writers.',
        'Handle IOException clearly.',
        'Test with missing files, empty files, and large files.',
      ],
      mistakes: [
        'Forgetting to close files or streams.',
        'Using character streams for binary data.',
        'Assuming a file path exists on every machine.',
        'Reading huge files fully into memory without checking size.',
      ],
      bestPractices: [
        'Prefer Path and Files for simple file operations.',
        'Specify charset when text encoding matters.',
        'Use buffering for repeated reads or writes.',
        'Validate file paths and permissions in user-facing apps.',
      ],
      debugging: [
        'Print the absolute path when a file is not found.',
        'Check permissions when writes fail.',
        'Confirm encoding when text looks corrupted.',
      ],
      interview: [
        'What is the difference between byte stream and character stream?',
        'Why use try-with-resources?',
        'When should buffered streams be used?',
      ],
      practice: [
        'Write a text file and read it back.',
        'Count lines in a file.',
        'Copy a binary file using byte streams.',
      ],
    },
    collections: {
      workflow: [
        'Decide whether you need ordering, uniqueness, key lookup, or queue behavior.',
        'Choose the interface type first: List, Set, Map, Queue, or Deque.',
        'Pick an implementation based on performance needs.',
        'Add, read, update, remove, and iterate through sample data.',
        'Test duplicates, missing keys, nulls, and ordering assumptions.',
      ],
      mistakes: [
        'Using HashMap or HashSet while expecting sorted order.',
        'Forgetting equals and hashCode for custom keys.',
        'Removing from a collection incorrectly while iterating.',
        'Choosing LinkedList for general use without measuring.',
      ],
      bestPractices: [
        'Program to interfaces such as List or Map.',
        'Choose ArrayList as the default List unless you have a specific reason.',
        'Use generics to avoid unsafe casts.',
        'Know Big-O costs for the collection you choose.',
      ],
      debugging: [
        'If lookup fails, verify equals and hashCode.',
        'If order changes, confirm the implementation guarantees order.',
        'If ConcurrentModificationException appears, use iterator.remove or collect changes separately.',
      ],
      interview: [
        'List vs Set vs Map: when do you use each?',
        'ArrayList vs LinkedList: what are the trade-offs?',
        'How do equals and hashCode affect hash-based collections?',
      ],
      practice: [
        'Build a frequency counter using HashMap.',
        'Remove duplicates with a Set while preserving order with LinkedHashSet.',
        'Sort a list using Comparator.',
      ],
    },
    jdbc: {
      workflow: [
        'Add the JDBC driver dependency for your database.',
        'Create or receive a database Connection.',
        'Use PreparedStatement for SQL with parameters.',
        'Execute query/update and process ResultSet or update count.',
        'Commit or rollback transactions when needed.',
        'Close resources with try-with-resources.',
      ],
      mistakes: [
        'Building SQL by concatenating user input.',
        'Leaking Connection, Statement, or ResultSet resources.',
        'Forgetting transaction boundaries for multi-step writes.',
        'Mixing database credentials into frontend code.',
      ],
      bestPractices: [
        'Use PreparedStatement for user-provided values.',
        'Keep SQL and transaction intent clear.',
        'Use a connection pool in production apps.',
        'Never expose database passwords in client-side JavaScript.',
      ],
      debugging: [
        'Log SQL shape without leaking sensitive parameter values.',
        'Check driver dependency and JDBC URL first when connection fails.',
        'For empty results, verify parameters and run the SQL directly in the database.',
      ],
      interview: [
        'What are the main JDBC steps?',
        'Why is PreparedStatement safer than Statement?',
        'What is transaction commit vs rollback?',
      ],
      practice: [
        'Write pseudo-code for SELECT with PreparedStatement.',
        'Explain how you would insert a user safely.',
        'Design a transaction for transferring balance between two accounts.',
      ],
    },
    memory: {
      workflow: [
        'Identify which values are local variables and which are objects.',
        'Trace references from active code to heap objects.',
        'Remove references that should no longer keep objects alive.',
        'Watch memory use under repeated operations.',
        'Use profiling tools when memory keeps growing.',
      ],
      mistakes: [
        'Assuming garbage collection fixes every memory problem.',
        'Keeping objects in static collections forever.',
        'Opening resources and relying on GC instead of closing them.',
        'Confusing stack variables with heap objects.',
      ],
      bestPractices: [
        'Keep object lifetimes as short and clear as possible.',
        'Use weak references only when you truly understand the use case.',
        'Close external resources explicitly.',
        'Measure memory before optimizing.',
      ],
      debugging: [
        'If memory grows continuously, take heap dumps over time.',
        'Look for large collections retaining objects.',
        'Check thread-local, cache, and listener references.',
      ],
      interview: [
        'What is stack vs heap?',
        'How does garbage collection decide what is collectible?',
        'How can memory leaks happen in Java?',
      ],
      practice: [
        'Draw stack and heap for a small object-creation example.',
        'Create and clear a list, then explain object reachability.',
        'Find where a static cache could leak memory.',
      ],
    },
    networking: {
      workflow: [
        'Identify client, server, address, port, and protocol.',
        'Set timeouts before sending requests.',
        'Send the smallest possible request.',
        'Handle status codes, exceptions, and retries.',
        'Validate and parse the response safely.',
      ],
      mistakes: [
        'No timeout, causing requests to hang.',
        'Assuming the network is reliable.',
        'Ignoring HTTP status codes.',
        'Logging secrets from request/response payloads.',
      ],
      bestPractices: [
        'Use timeouts and bounded retries.',
        'Keep authentication secrets server-side.',
        'Validate remote data before trusting it.',
        'Prefer mature HTTP clients/frameworks for application code.',
      ],
      debugging: [
        'Check DNS, host, port, protocol, and firewall first.',
        'Log status code and safe error details.',
        'Reproduce the request with curl or Postman when possible.',
      ],
      interview: [
        'What is a socket?',
        'What is the difference between client and server?',
        'Why are timeouts important in network code?',
      ],
      practice: [
        'Send a simple HTTP GET request.',
        'Handle a failed request gracefully.',
        'Explain how a server listens on a port.',
      ],
    },
    quizzes: {},
    core: {},
  };

  return { ...groupProfiles[group], ...groupEnhancements[group] };
}

const exactProfiles: Record<string, Partial<JavaTopicProfile>> = {
  'what-is-java': {
    definition: 'Java is a high-level, class-based, object-oriented programming language designed to run the same compiled bytecode on many platforms through the JVM.',
    mentalModel: 'Write Java source code once, compile it into bytecode, then let the JVM run that bytecode on Windows, Linux, macOS, or servers.',
    why: [
      'Java is widely used in backend systems, Android, enterprise software, banking, big data tools, and cloud services.',
      'Its type system, JVM, libraries, and tooling make it suitable for long-lived production applications.',
      'Learning Java gives a strong base for OOP, DSA, Spring Boot, Android, and enterprise APIs.',
    ],
    core: [
      'Source code is written in .java files.',
      'javac compiles source code into .class bytecode.',
      'The JVM executes bytecode and provides platform independence.',
      'The standard library provides collections, I/O, networking, concurrency, and utilities.',
      'Most Java programs are organized around classes and objects.',
    ],
    example: `public class Main {\n    public static void main(String[] args) {\n        String language = "Java";\n        System.out.println(language + " runs on the JVM");\n    }\n}`,
    walkthrough: [
      'public class Main declares a class named Main.',
      'main is the entry point that the JVM calls first.',
      'String language stores text.',
      'System.out.println prints output to the console.',
    ],
    interview: [
      'What is Java, and why is it called platform independent?',
      'What is the role of the JVM?',
      'What is bytecode?',
      'Where is Java commonly used today?',
      'How is Java different from JavaScript?',
    ],
  },
  'history-of-java': {
    definition: 'Java began at Sun Microsystems in the 1990s and became popular because it offered portable bytecode, a safer runtime model, and a rich standard library.',
    mentalModel: 'Java evolved from applets and desktop/server software into a dominant backend, Android, and enterprise platform.',
    core: [
      'The language was created at Sun Microsystems and later became part of Oracle.',
      'The original promise was portability: write once, run anywhere.',
      'Major releases added generics, annotations, lambdas, streams, modules, records, and modern JVM improvements.',
      'The ecosystem matters as much as the language: build tools, IDEs, servers, frameworks, and libraries.',
    ],
    example: `public class Main {\n    public static void main(String[] args) {\n        int firstPublicRelease = 1996;\n        int modernLtsExample = 21;\n        System.out.println("Java public release: " + firstPublicRelease);\n        System.out.println("Modern LTS example: Java " + modernLtsExample);\n    }\n}`,
  },
  'features-of-java': {
    definition: 'Java features are the language and runtime qualities that make Java practical: object orientation, platform independence, strong typing, automatic memory management, security, multithreading, and a large standard library.',
    mentalModel: 'Java is not just syntax. It is a language plus compiler plus JVM plus libraries plus tooling.',
    core: [
      'Object-oriented: classes and objects organize code.',
      'Platform independent: bytecode runs on a JVM for the target system.',
      'Robust: compile-time checks and exception handling catch many problems.',
      'Secure: runtime checks and managed memory reduce several low-level risks.',
      'Multithreaded: concurrency support is built into the platform.',
      'Portable: primitive sizes and bytecode behavior are defined consistently.',
    ],
    comparison: [
      ['Feature', 'What it means', 'Practical impact'],
      ['Platform independence', 'Bytecode runs on JVMs', 'Same app can run across operating systems'],
      ['Automatic memory management', 'Garbage collector frees unreachable objects', 'Fewer manual memory bugs than C/C++'],
      ['Strong typing', 'Types are checked before runtime where possible', 'Many bugs are caught early'],
    ],
  },
  'cpp-vs-java': {
    definition: 'C++ and Java are both general-purpose languages, but C++ gives lower-level control while Java prioritizes managed runtime safety, portability, and standard enterprise tooling.',
    mentalModel: 'C++ is closer to the machine; Java is closer to a managed platform.',
    core: [
      'C++ compiles to native machine code; Java compiles to JVM bytecode.',
      'C++ supports manual memory control; Java uses garbage collection.',
      'C++ has multiple inheritance for classes; Java uses single class inheritance plus interfaces.',
      'C++ is common in systems, game engines, and performance-critical native code; Java is common in backend and enterprise systems.',
    ],
    comparison: [
      ['Aspect', 'C++', 'Java'],
      ['Execution', 'Native binary', 'Bytecode on JVM'],
      ['Memory', 'Manual plus RAII/smart pointers', 'Garbage collected heap'],
      ['Inheritance', 'Multiple class inheritance supported', 'Single class inheritance plus interfaces'],
      ['Pointers', 'Direct pointer support', 'References without pointer arithmetic'],
      ['Use cases', 'Systems, embedded, engines', 'Backend, Android, enterprise apps'],
    ],
  },
  'hello-world': {
    definition: 'A Java Hello World program is the smallest practical program used to confirm that the JDK, compiler, JVM, file name, class name, and console output are working.',
    mentalModel: 'Hello World is not just printing text. It verifies the complete Java edit -> compile -> run loop.',
    workflow: [
      'Create a file named Main.java.',
      'Write a public class named Main.',
      'Add public static void main(String[] args).',
      'Run javac Main.java.',
      'Run java Main.',
    ],
    example: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`,
    walkthrough: [
      'public allows the class to be visible.',
      'class Main defines the class name. If the class is public, the file should be Main.java.',
      'static lets the JVM call main without creating an object first.',
      'void means main does not return a value.',
      'String[] args receives command-line arguments.',
      'System.out.println writes a line to the console.',
    ],
    mistakes: [
      'Saving the file with a name that does not match the public class.',
      'Writing Main instead of main.',
      'Forgetting semicolon after println.',
      'Running java Main.class instead of java Main.',
    ],
  },
  'internal-details': {
    definition: 'Java program internal details describe what happens after you write source code: compilation, class loading, bytecode verification, interpretation/JIT compilation, execution, and garbage collection.',
    mentalModel: 'Java execution is a pipeline: source code -> bytecode -> class loader -> JVM runtime -> machine execution.',
    core: [
      'javac converts .java source into .class bytecode.',
      'The class loader loads required classes.',
      'The bytecode verifier checks safety rules.',
      'The JVM interprets bytecode and may JIT compile hot code to native instructions.',
      'The garbage collector reclaims unreachable heap objects.',
    ],
    example: `// Terminal flow\n// 1. javac Main.java\n// 2. java Main\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println(Main.class.getName());\n    }\n}`,
  },
  'set-path': {
    definition: 'Setting the Java path means making commands such as javac and java available from the terminal by pointing the operating system to the JDK bin directory.',
    mentalModel: 'PATH is a list of folders your terminal searches when you type a command.',
    workflow: [
      'Install a JDK, not only a JRE.',
      'Find the JDK bin directory.',
      'Add that bin directory to PATH.',
      'Open a new terminal.',
      'Run java -version and javac -version.',
    ],
    example: `# Linux/macOS example\nexport JAVA_HOME=/path/to/jdk\nexport PATH="$JAVA_HOME/bin:$PATH"\njava -version\njavac -version\n\n# Windows idea\n# Add C:\\Program Files\\Java\\jdk-xx\\bin to PATH`,
    mistakes: [
      'Installing only a runtime and expecting javac to exist.',
      'Editing PATH but keeping the old terminal open.',
      'Pointing JAVA_HOME to bin instead of the JDK root folder.',
    ],
  },
  'jdk-jre-jvm': {
    definition: 'JDK, JRE, and JVM are three layers of the Java platform: JDK is for development, JRE is for running apps, and JVM is the engine that executes bytecode.',
    mentalModel: 'JDK contains development tools, JRE contains runtime libraries, JVM executes bytecode.',
    core: [
      'JDK = Java Development Kit. It includes javac, java, jar, tools, runtime libraries, and the JVM.',
      'JRE = Java Runtime Environment. It runs Java programs but does not include all developer tools.',
      'JVM = Java Virtual Machine. It loads, verifies, and executes bytecode.',
      'Modern JDK distributions often include everything needed for both development and running.',
    ],
    comparison: [
      ['Term', 'Contains', 'Use'],
      ['JDK', 'Compiler, tools, libraries, JVM', 'Develop and run Java apps'],
      ['JRE', 'Runtime libraries and JVM', 'Run Java apps'],
      ['JVM', 'Execution engine', 'Execute bytecode'],
    ],
  },
  'jvm-machine': {
    definition: 'The JVM is the virtual machine that loads Java bytecode, verifies it, manages memory, executes code, and provides runtime services such as garbage collection.',
    mentalModel: 'The JVM is the managed execution box where Java bytecode becomes running behavior.',
    core: [
      'Class Loader loads classes into memory.',
      'Bytecode Verifier checks type and safety constraints.',
      'Runtime data areas include stack, heap, method area, and program counter.',
      'Execution engine interprets or JIT compiles bytecode.',
      'Garbage collector manages unreachable heap objects.',
    ],
  },
  variables: {
    definition: 'A Java variable is a named storage location with a declared type. The type decides what kind of value the variable can hold.',
    mentalModel: 'A variable is a labeled box, but Java requires the label to say what kind of value belongs inside.',
    core: [
      'Local variables live inside methods and must be initialized before use.',
      'Instance variables belong to objects.',
      'Static variables belong to the class.',
      'Final variables cannot be assigned again after initialization.',
    ],
    syntax: [
      'type name = value;',
      'int age = 20;',
      'String name = "Ayesha";',
      'final double PI = 3.14159;',
    ],
    example: `public class Main {\n    static int totalUsers = 0;\n\n    public static void main(String[] args) {\n        int age = 20;\n        String name = "Ayesha";\n        totalUsers++;\n        System.out.println(name + " is " + age);\n    }\n}`,
  },
  identifiers: {
    definition: 'Identifiers are names given to variables, methods, classes, packages, and other program elements.',
    mentalModel: 'Identifiers are labels that let humans and the compiler refer to a program element.',
    core: [
      'Identifiers can contain letters, digits, underscore, and dollar sign.',
      'They cannot start with a digit.',
      'They cannot be Java keywords.',
      'Good identifiers explain purpose, not just type.',
    ],
    example: `public class StudentReport {\n    public static void main(String[] args) {\n        int totalMarks = 450;\n        String studentName = "Ali";\n        System.out.println(studentName + ": " + totalMarks);\n    }\n}`,
  },
  'data-types': {
    definition: 'Java data types define what kind of value a variable can store. Java has primitive types for basic values and reference types for objects.',
    mentalModel: 'A type is a contract between your code and the compiler: this variable will hold this kind of value.',
    core: [
      'Primitive types include byte, short, int, long, float, double, char, and boolean.',
      'Reference types include String, arrays, classes, interfaces, enums, and records.',
      'Primitive variables store raw values; reference variables store references to objects.',
      'Type choice affects memory, range, precision, and allowed operations.',
    ],
    comparison: [
      ['Type category', 'Examples', 'Purpose'],
      ['Integer', 'byte, short, int, long', 'Whole numbers'],
      ['Floating point', 'float, double', 'Decimal approximation'],
      ['Character', 'char', 'Single UTF-16 code unit'],
      ['Boolean', 'boolean', 'true/false decisions'],
      ['Reference', 'String, arrays, objects', 'Structured data and behavior'],
    ],
  },
  'type-casting': {
    definition: 'Type casting converts a value from one type to another. Java performs safe widening automatically and requires explicit casting for narrowing conversions.',
    mentalModel: 'Widening is moving into a bigger container; narrowing is squeezing into a smaller container and may lose data.',
    core: [
      'Widening conversion is automatic, such as int to long.',
      'Narrowing conversion needs an explicit cast, such as double to int.',
      'Object casting requires the runtime object to actually match the target type.',
      'Bad object casts throw ClassCastException.',
    ],
    example: `public class Main {\n    public static void main(String[] args) {\n        int marks = 95;\n        double precise = marks;\n        int rounded = (int) 95.75;\n        System.out.println(precise);\n        System.out.println(rounded);\n    }\n}`,
  },
  unicode: {
    definition: 'Java uses Unicode so programs can represent text from many writing systems instead of only ASCII characters.',
    mentalModel: 'Unicode is a shared numbering system for characters across languages.',
    core: [
      'char is a 16-bit UTF-16 code unit.',
      'String handles sequences of characters/code units.',
      'Some real-world characters may need more than one char due to Unicode supplementary characters.',
      'Use UTF-8 for files and network text unless there is a strong reason otherwise.',
    ],
    example: `public class Main {\n    public static void main(String[] args) {\n        char letter = 'A';\n        String greeting = "Java";\n        System.out.println(letter);\n        System.out.println(greeting);\n    }\n}`,
  },
  operators: {
    definition: 'Operators are symbols that perform operations on values, such as arithmetic, comparison, logical decisions, assignment, and bit manipulation.',
    mentalModel: 'Operators are compact verbs in code: they calculate, compare, combine, or assign.',
    core: [
      'Arithmetic operators include +, -, *, /, and %.',
      'Comparison operators return boolean values.',
      'Logical operators combine boolean expressions.',
      'Assignment operators update variables.',
      'Operator precedence decides evaluation order, but parentheses are clearer.',
    ],
    example: `public class Main {\n    public static void main(String[] args) {\n        int score = 82;\n        boolean passed = score >= 50 && score <= 100;\n        System.out.println("Passed: " + passed);\n    }\n}`,
  },
  keywords: {
    definition: 'Java keywords are reserved words with predefined meaning in the language, so they cannot be used as identifiers.',
    mentalModel: 'Keywords are grammar words that Java keeps for itself.',
    core: [
      'Examples include class, public, static, void, if, else, for, while, try, catch, final, and new.',
      'Keywords are lowercase.',
      'You cannot name a variable class or public.',
      'Contextual keywords may behave specially in certain positions in newer Java versions.',
    ],
  },
  'if-else': {
    definition: 'if-else executes different code blocks depending on whether a boolean condition is true or false.',
    mentalModel: 'An if statement is a fork in the road.',
    syntax: ['if (condition) { ... } else { ... }'],
    example: `public class Main {\n    public static void main(String[] args) {\n        int marks = 72;\n        if (marks >= 50) {\n            System.out.println("Pass");\n        } else {\n            System.out.println("Fail");\n        }\n    }\n}`,
  },
  switch: {
    definition: 'switch selects one branch from many possible values. It is useful when one expression is compared against several fixed cases.',
    mentalModel: 'switch is a clean menu for multiple known choices.',
    core: [
      'Use switch when choices are discrete and clear.',
      'Classic switch statements often need break to avoid fall-through.',
      'Modern switch expressions can return values and avoid accidental fall-through.',
    ],
    example: `public class Main {\n    public static void main(String[] args) {\n        int day = 2;\n        String name = switch (day) {\n            case 1 -> "Monday";\n            case 2 -> "Tuesday";\n            default -> "Unknown";\n        };\n        System.out.println(name);\n    }\n}`,
  },
  'for-loop': {
    definition: 'A for loop repeats code when the number of iterations or the iteration pattern is known.',
    mentalModel: 'A for loop is a controlled counter: initialize, check, run, update.',
    syntax: ['for (initialization; condition; update) { ... }'],
    example: `public class Main {\n    public static void main(String[] args) {\n        for (int i = 1; i <= 5; i++) {\n            System.out.println("Count: " + i);\n        }\n    }\n}`,
  },
  'while-loop': {
    definition: 'A while loop repeats code as long as a condition remains true. It is best when you do not know the exact number of repetitions in advance.',
    mentalModel: 'while means keep going until the condition becomes false.',
    syntax: ['while (condition) { ... }'],
    example: `public class Main {\n    public static void main(String[] args) {\n        int attempts = 3;\n        while (attempts > 0) {\n            System.out.println("Attempts left: " + attempts);\n            attempts--;\n        }\n    }\n}`,
  },
  'do-while': {
    definition: 'A do-while loop runs the body once before checking the condition, then repeats while the condition is true.',
    mentalModel: 'do-while means do it first, then ask whether to continue.',
    syntax: ['do { ... } while (condition);'],
    example: `public class Main {\n    public static void main(String[] args) {\n        int count = 1;\n        do {\n            System.out.println(count);\n            count++;\n        } while (count <= 3);\n    }\n}`,
  },
  break: {
    definition: 'break exits the nearest loop or switch immediately.',
    mentalModel: 'break is an emergency exit from the current repeated or selected block.',
    example: `public class Main {\n    public static void main(String[] args) {\n        for (int i = 1; i <= 10; i++) {\n            if (i == 4) {\n                break;\n            }\n            System.out.println(i);\n        }\n    }\n}`,
  },
  continue: {
    definition: 'continue skips the rest of the current loop iteration and moves to the next iteration.',
    mentalModel: 'continue says skip this round, but keep the loop alive.',
    example: `public class Main {\n    public static void main(String[] args) {\n        for (int i = 1; i <= 5; i++) {\n            if (i == 3) {\n                continue;\n            }\n            System.out.println(i);\n        }\n    }\n}`,
  },
  comments: {
    definition: 'Comments are notes in source code ignored by the compiler. They explain intent, warnings, or non-obvious decisions.',
    mentalModel: 'Good comments explain why, not what the code already says.',
    core: [
      'Use // for single-line comments.',
      'Use /* ... */ for block comments.',
      'Use Javadoc comments /** ... */ for public API documentation.',
      'Avoid stale comments that disagree with code.',
    ],
    example: `public class Main {\n    /** Returns the square of a number. */\n    static int square(int value) {\n        return value * value; // multiply value by itself\n    }\n}`,
  },
  programs: {
    definition: 'Java Programs practice means solving small complete tasks so syntax, logic, compilation, and debugging become automatic.',
    mentalModel: 'Programs connect many tiny concepts into one working flow.',
    core: [
      'Start with input, processing, and output.',
      'Keep one problem per file while learning.',
      'Test normal cases and edge cases.',
      'Refactor repeated logic into methods.',
    ],
    example: `public class Main {\n    static boolean isEven(int value) {\n        return value % 2 == 0;\n    }\n\n    public static void main(String[] args) {\n        for (int i = 1; i <= 5; i++) {\n            System.out.println(i + " even? " + isEven(i));\n        }\n    }\n}`,
  },
  'object-class': {
    definition: 'A class is a blueprint that defines fields and methods; an object is a runtime instance created from that blueprint.',
    mentalModel: 'Class is the design. Object is the actual thing made from the design.',
    core: [
      'Fields store object state.',
      'Methods define object behavior.',
      'new creates an object.',
      'Each object has its own instance field values.',
    ],
    example: `class Student {\n    String name;\n    int marks;\n\n    void printReport() {\n        System.out.println(name + " scored " + marks);\n    }\n}\n\npublic class Main {\n    public static void main(String[] args) {\n        Student student = new Student();\n        student.name = "Sara";\n        student.marks = 91;\n        student.printReport();\n    }\n}`,
  },
  constructor: {
    definition: 'A constructor is a special block used to initialize a new object when it is created.',
    mentalModel: 'A constructor is the object setup step that runs right after new.',
    core: [
      'Constructor name matches the class name.',
      'Constructors do not declare a return type.',
      'They can be overloaded with different parameter lists.',
      'If no constructor is written, Java provides a default no-argument constructor.',
    ],
    example: `class Student {\n    String name;\n\n    Student(String name) {\n        this.name = name;\n    }\n}\n\npublic class Main {\n    public static void main(String[] args) {\n        Student student = new Student("Sara");\n        System.out.println(student.name);\n    }\n}`,
  },
  'static-keyword': {
    definition: 'static marks a member as belonging to the class itself rather than to each object instance.',
    mentalModel: 'static is shared at class level; instance members belong to each object.',
    core: [
      'static fields are shared by all instances of the class.',
      'static methods can be called without creating an object.',
      'static methods cannot directly access instance fields without an object reference.',
      'Use static for constants, utility methods, and shared class-level state carefully.',
    ],
    example: `class Counter {\n    static int count = 0;\n\n    Counter() {\n        count++;\n    }\n}\n\npublic class Main {\n    public static void main(String[] args) {\n        new Counter();\n        new Counter();\n        System.out.println(Counter.count);\n    }\n}`,
  },
  'this-keyword': {
    definition: 'this refers to the current object inside an instance method or constructor.',
    mentalModel: 'this means the object currently executing this code.',
    core: [
      'Use this to access current object fields.',
      'Use this when parameter names shadow field names.',
      'Use this(...) to call another constructor in the same class.',
    ],
    example: `class User {\n    String name;\n\n    User(String name) {\n        this.name = name;\n    }\n}`,
  },
  methods: {
    definition: 'A method is a named block of code that performs a task and can receive inputs and return a result.',
    mentalModel: 'A method is a reusable action with a name, parameters, and optional output.',
    core: [
      'Method signature includes name and parameter types.',
      'Return type declares what comes back.',
      'void means nothing is returned.',
      'Small methods are easier to test and reuse.',
    ],
    example: `public class Main {\n    static int add(int a, int b) {\n        return a + b;\n    }\n\n    public static void main(String[] args) {\n        System.out.println(add(2, 3));\n    }\n}`,
  },
  recursion: {
    definition: 'Recursion is when a method solves a problem by calling itself with a smaller version of the problem.',
    mentalModel: 'Recursion needs a stopping condition and progress toward that condition.',
    core: [
      'Base case stops the recursion.',
      'Recursive case reduces the problem.',
      'Each call uses stack memory.',
      'Too many recursive calls can cause StackOverflowError.',
    ],
    example: `public class Main {\n    static int factorial(int n) {\n        if (n <= 1) {\n            return 1;\n        }\n        return n * factorial(n - 1);\n    }\n\n    public static void main(String[] args) {\n        System.out.println(factorial(5));\n    }\n}`,
  },
  inheritance: {
    definition: 'Inheritance lets one class reuse and extend another class by forming an is-a relationship.',
    mentalModel: 'A child class is a specialized version of its parent class.',
    core: [
      'extends creates class inheritance.',
      'A subclass inherits accessible fields and methods.',
      'Overriding lets a subclass provide specialized behavior.',
      'Use inheritance only when substitution makes sense.',
    ],
    example: `class Animal {\n    void speak() {\n        System.out.println("Animal sound");\n    }\n}\n\nclass Dog extends Animal {\n    @Override\n    void speak() {\n        System.out.println("Bark");\n    }\n}\n\npublic class Main {\n    public static void main(String[] args) {\n        Animal pet = new Dog();\n        pet.speak();\n    }\n}`,
  },
  'method-overloading': {
    definition: 'Method overloading means defining multiple methods with the same name but different parameter lists in the same class.',
    mentalModel: 'Same action name, different input shapes.',
    core: [
      'Overloading is resolved at compile time.',
      'Return type alone cannot overload a method.',
      'Parameter number, type, or order must differ.',
    ],
    example: `class Calculator {\n    int add(int a, int b) {\n        return a + b;\n    }\n\n    int add(int a, int b, int c) {\n        return a + b + c;\n    }\n}`,
  },
  'method-overriding': {
    definition: 'Method overriding means a subclass provides its own implementation of a method already defined in the parent class.',
    mentalModel: 'The parent promises behavior; the child customizes it.',
    core: [
      'Overriding is resolved at runtime through dynamic dispatch.',
      'The method name, parameters, and compatible return type must match.',
      '@Override helps the compiler catch mistakes.',
    ],
  },
  'abstract-class': {
    definition: 'An abstract class is a class that cannot be directly instantiated and may contain abstract methods that subclasses must implement.',
    mentalModel: 'An abstract class is a partial blueprint: some behavior is shared, some is left for subclasses.',
    core: [
      'Use abstract when a base type should not be created directly.',
      'Abstract classes can have fields, constructors, concrete methods, and abstract methods.',
      'A subclass must implement inherited abstract methods unless it is also abstract.',
    ],
    example: `abstract class Shape {\n    abstract double area();\n}\n\nclass Circle extends Shape {\n    private final double radius;\n\n    Circle(double radius) {\n        this.radius = radius;\n    }\n\n    @Override\n    double area() {\n        return Math.PI * radius * radius;\n    }\n}`,
  },
  interface: {
    definition: 'An interface defines a contract that classes can implement. It focuses on what behavior is available, not how it is stored internally.',
    mentalModel: 'An interface is a promise: any implementing class agrees to provide these operations.',
    core: [
      'A class uses implements to satisfy an interface.',
      'Interfaces support polymorphism without forcing a shared parent class.',
      'Modern Java interfaces can include default and static methods.',
    ],
    example: `interface Payable {\n    double amount();\n}\n\nclass Invoice implements Payable {\n    public double amount() {\n        return 250.0;\n    }\n}`,
  },
  encapsulation: {
    definition: 'Encapsulation hides internal object state and exposes controlled operations through methods.',
    mentalModel: 'Keep fields protected; let methods enforce rules.',
    core: [
      'Use private fields.',
      'Expose safe getters/setters or behavior methods.',
      'Validate input before changing object state.',
      'Do not expose mutable internals directly.',
    ],
  },
  string: {
    definition: "String is Java's main class for representing text. String objects are immutable.",
    mentalModel: 'A String value does not change; operations produce a new String.',
    core: [
      'String literals may be stored in the string pool.',
      'Use equals for content comparison.',
      'Use StringBuilder for repeated concatenation.',
      'Be careful with null before calling String methods.',
    ],
  },
  'immutable-string': {
    definition: 'String is immutable so its content cannot change after creation. This improves safety, sharing, caching, and predictable behavior.',
    mentalModel: 'Changing a String actually creates another String.',
    core: [
      'Immutability helps String pooling.',
      'It makes String safer for HashMap keys.',
      'It avoids unexpected changes when references are shared.',
      'It improves thread safety for text values.',
    ],
  },
  stringbuilder: {
    definition: 'StringBuilder is a mutable text builder used when you need many string modifications efficiently in one thread.',
    mentalModel: 'StringBuilder is a growable text buffer.',
    example: `public class Main {\n    public static void main(String[] args) {\n        StringBuilder builder = new StringBuilder();\n        for (int i = 1; i <= 3; i++) {\n            builder.append("Java ").append(i).append("\\n");\n        }\n        System.out.println(builder.toString());\n    }\n}`,
  },
  exceptions: {
    definition: 'Java exceptions represent abnormal conditions that disrupt normal program flow.',
    mentalModel: 'Throw an exception when the current code cannot complete its promise safely.',
  },
  'try-catch': {
    definition: 'try-catch handles exceptions by wrapping risky code in try and recovery code in catch.',
    mentalModel: 'try says attempt this; catch says if this failure happens, handle it here.',
  },
  'final-finally-finalize': {
    definition: 'final, finally, and finalize are different: final restricts reassignment/inheritance/overriding, finally runs cleanup code, and finalize was an old object cleanup hook that should not be used in modern Java.',
    mentalModel: 'final is a rule, finally is a control-flow block, finalize is legacy cleanup.',
    comparison: [
      ['Term', 'Category', 'Meaning'],
      ['final', 'Keyword', 'Prevents reassignment, overriding, or inheritance depending on usage'],
      ['finally', 'Block', 'Runs after try/catch for cleanup'],
      ['finalize', 'Method', 'Legacy GC callback; avoid it'],
    ],
  },
  'multithreading-intro': {
    definition: 'Multithreading means running multiple threads in the same Java process so work can happen concurrently.',
    mentalModel: 'Threads share process memory, so they are powerful but need coordination.',
  },
  'thread-lifecycle': {
    definition: 'A Java thread moves through lifecycle states such as NEW, RUNNABLE, BLOCKED, WAITING, TIMED_WAITING, and TERMINATED.',
    mentalModel: 'Thread state tells you whether it has not started, can run, is waiting for something, or is finished.',
    comparison: [
      ['State', 'Meaning', 'Example cause'],
      ['NEW', 'Created but not started', 'new Thread(...)'],
      ['RUNNABLE', 'Ready/running on CPU', 'after start()'],
      ['BLOCKED', 'Waiting for a monitor lock', 'entering synchronized block'],
      ['WAITING', 'Waiting indefinitely', 'join() or wait()'],
      ['TIMED_WAITING', 'Waiting with timeout', 'sleep(1000)'],
      ['TERMINATED', 'Finished execution', 'run method completed'],
    ],
  },
  'create-thread': {
    definition: 'A thread can be created by extending Thread, implementing Runnable, or using higher-level executors.',
    mentalModel: 'Prefer describing the task separately from the thread that runs it.',
    example: `public class Main {\n    public static void main(String[] args) throws InterruptedException {\n        Runnable task = () -> System.out.println("Work");\n        Thread thread = new Thread(task);\n        thread.start();\n        thread.join();\n    }\n}`,
  },
  'sync-intro': {
    definition: 'Synchronization controls access to shared mutable data so only one thread enters a critical section at a time.',
    mentalModel: 'A synchronized block is a locked room: one thread enters while others wait.',
    example: `class Counter {\n    private int value;\n\n    synchronized void increment() {\n        value++;\n    }\n\n    int getValue() {\n        return value;\n    }\n}`,
  },
  deadlock: {
    definition: 'Deadlock happens when threads wait forever because each holds a resource the other needs.',
    mentalModel: 'Two people each hold one key and wait for the other key before moving.',
    core: [
      'Deadlock requires mutual exclusion, hold-and-wait, no preemption, and circular wait.',
      'Avoid nested locks where possible.',
      'Acquire locks in a consistent global order.',
      'Use timeouts or higher-level concurrency utilities.',
    ],
  },
  'collections-intro': {
    definition: 'The Java Collections Framework provides interfaces and classes for lists, sets, maps, queues, sorting, searching, and iteration.',
    mentalModel: 'Choose the container based on the job: ordered sequence, unique values, lookup by key, or processing queue.',
  },
  arraylist: {
    definition: 'ArrayList is a resizable array implementation of List. It is fast for index access and appending, but slower for inserts/removes near the front.',
    mentalModel: 'ArrayList is an array that grows for you.',
    core: [
      'get(index) is fast.',
      'add at the end is usually fast.',
      'Inserting/removing in the middle shifts elements.',
      'It allows duplicates and preserves insertion order.',
    ],
    comparison: [
      ['Operation', 'ArrayList behavior', 'Practical note'],
      ['get(index)', 'Very fast', 'Direct index access'],
      ['add at end', 'Usually fast', 'May resize when capacity is full'],
      ['insert/remove middle', 'Slower', 'Elements must shift'],
      ['search by value', 'Linear', 'Use Map/Set when lookup is the main need'],
    ],
    mistakes: [
      'Confusing size with capacity.',
      'Removing elements in a for-each loop and causing ConcurrentModificationException.',
      'Using ArrayList for frequent front insertions/removals.',
      'Forgetting generics and then dealing with unsafe casts.',
    ],
    interview: [
      'How does ArrayList grow internally?',
      'What is the difference between size and capacity?',
      'Why is get(index) fast but remove(0) slower?',
      'ArrayList vs LinkedList: which is better for most application code?',
    ],
    practice: [
      'Create an ArrayList of five names and print them in insertion order.',
      'Remove one element safely by index and one by value.',
      'Write a short comparison of ArrayList and LinkedList for insert, remove, and get.',
    ],
  },
  hashmap: {
    definition: 'HashMap stores key-value pairs and uses hashing to make lookup, insert, and delete usually fast.',
    mentalModel: 'A HashMap is a set of buckets. A key hash decides the bucket; equals confirms the exact key.',
    core: [
      'Keys should have stable equals and hashCode behavior.',
      'HashMap allows one null key and multiple null values.',
      'Iteration order is not guaranteed.',
      'Worst-case performance depends on collisions, but modern HashMap mitigates heavy collision chains.',
    ],
    mistakes: [
      'Using a mutable object as a key and then changing fields used by hashCode.',
      'Expecting HashMap iteration order to stay stable.',
      'Implementing equals without a compatible hashCode.',
      'Using HashMap from multiple threads without external coordination.',
    ],
    bestPractices: [
      'Use immutable or stable keys.',
      'Override equals and hashCode together.',
      'Use LinkedHashMap when insertion order matters.',
      'Use ConcurrentHashMap for concurrent access patterns.',
    ],
    interview: [
      'How does HashMap find a value by key?',
      'Why must equals and hashCode agree?',
      'What happens when two keys have the same hash bucket?',
      'HashMap vs Hashtable vs ConcurrentHashMap: when would you use each?',
    ],
  },
  'jdbc-intro': {
    definition: 'JDBC is the standard Java API for connecting to relational databases and executing SQL.',
    mentalModel: 'Java sends SQL through a JDBC driver; the database returns rows or update counts.',
  },
  'jdbc-steps': {
    definition: 'JDBC database connectivity usually follows five steps: load/register driver, create connection, create statement, execute query/update, close resources.',
    mentalModel: 'Connect, prepare, execute, read, close.',
    workflow: [
      'Add the database driver dependency.',
      'Create a Connection.',
      'Create a PreparedStatement.',
      'Bind parameters.',
      'Execute query or update.',
      'Read ResultSet or update count.',
      'Commit or rollback if using manual transactions.',
      'Close resources with try-with-resources.',
    ],
  },
  preparedstatement: {
    definition: 'PreparedStatement is a precompiled SQL statement with placeholders for values. It is safer and cleaner than string-concatenated SQL.',
    mentalModel: 'SQL shape stays fixed; user values are bound separately.',
    core: [
      'Use ? placeholders for parameters.',
      'Bind values with setString, setInt, and similar methods.',
      'It helps prevent SQL injection.',
      'It can improve performance when reused by the database/driver.',
    ],
    example: `String sql = "INSERT INTO users(name, email) VALUES (?, ?)";\n// try (PreparedStatement ps = connection.prepareStatement(sql)) {\n//     ps.setString(1, name);\n//     ps.setString(2, email);\n//     int inserted = ps.executeUpdate();\n//     System.out.println("Rows inserted: " + inserted);\n// }`,
    mistakes: [
      'Concatenating user input into SQL before preparing it.',
      'Binding parameters in the wrong order.',
      'Using executeQuery for INSERT/UPDATE/DELETE instead of executeUpdate.',
      'Forgetting to close the statement and result set.',
    ],
    interview: [
      'Why does PreparedStatement help against SQL injection?',
      'What is the difference between Statement and PreparedStatement?',
      'When do you use executeQuery vs executeUpdate?',
      'How should JDBC resources be closed?',
    ],
  },
  'java-8-features': {
    definition: 'Java 8 introduced major language and library features such as lambda expressions, functional interfaces, Stream API, default interface methods, Optional, and the modern date/time API.',
    mentalModel: 'Java 8 made Java more expressive for collection processing and functional-style code.',
    core: [
      'Lambdas make behavior easy to pass around.',
      'Stream API supports map/filter/reduce style data processing.',
      'Optional represents possible absence explicitly.',
      'java.time replaced many painful Date/Calendar use cases.',
    ],
    example: `import java.util.List;\n\npublic class Main {\n    public static void main(String[] args) {\n        List<String> names = List.of("Ali", "Sara", "Ahmed");\n        names.stream()\n            .filter(name -> name.startsWith("A"))\n            .forEach(System.out::println);\n    }\n}`,
  },
};

function topicProfile(topicId: string, title: string, group: JavaGroup): JavaTopicProfile {
  const base = buildBaseProfile(group, title);
  const exact = exactProfiles[topicId];
  if (!exact) {
    if (/\bvs\b|versus|difference/i.test(title)) return buildComparisonFallback(title, base);
    if (/how to/i.test(title)) return buildHowToFallback(title, base);
    return base;
  }

  return {
    ...base,
    ...exact,
    why: exact.why || base.why,
    core: exact.core || base.core,
    workflow: exact.workflow || base.workflow,
    walkthrough: exact.walkthrough || base.walkthrough,
    mistakes: exact.mistakes || base.mistakes,
    bestPractices: exact.bestPractices || base.bestPractices,
    debugging: exact.debugging || base.debugging,
    interview: exact.interview || base.interview,
    practice: exact.practice || base.practice,
  };
}

function buildComparisonFallback(title: string, base: JavaTopicProfile): JavaTopicProfile {
  return {
    ...base,
    definition: `${title} is a comparison topic. The goal is to understand the difference in meaning, use case, behavior, and trade-offs.`,
    mentalModel: 'Comparison topics are decision tools: learn what each option is good at, then choose based on constraints.',
    core: [
      'Define both sides separately before comparing.',
      'Compare syntax, runtime behavior, memory/performance, and real use cases.',
      'Do not memorize only one-line differences; connect each difference to a coding decision.',
    ],
    comparison: [
      ['Aspect', 'First concept', 'Second concept'],
      ['Purpose', 'What problem it solves', 'What problem it solves differently'],
      ['Runtime behavior', 'How it behaves when code runs', 'How behavior changes'],
      ['Best use', 'When it is the better fit', 'When the other option is better'],
    ],
  };
}

function buildHowToFallback(title: string, base: JavaTopicProfile): JavaTopicProfile {
  return {
    ...base,
    definition: `${title} is a workflow topic. The important part is learning the correct sequence, verifying each step, and knowing what can fail.`,
    mentalModel: 'A how-to topic should be learned like a checklist: prepare, execute, verify, then debug.',
    workflow: [
      'Confirm prerequisites first.',
      'Perform the smallest working setup.',
      'Run a verification command or small program.',
      'Read the exact error message if something fails.',
      'Document the fixed setup so you can repeat it later.',
    ],
  };
}

function difficultyDepth(difficulty: Difficulty, hinglish: boolean) {
  if (hinglish) {
    if (difficulty === 'beginner') return 'Beginner mode: simple wording, small code, aur har step ka reason.';
    if (difficulty === 'expert') return 'Expert mode: internals, edge cases, performance, production mistakes, aur interview depth.';
    return 'Standard mode: concept, code, debugging, aur interview balance.';
  }

  if (difficulty === 'beginner') return 'Beginner mode: simple wording, small code, and every step explained.';
  if (difficulty === 'expert') return 'Expert mode: internals, edge cases, performance, production mistakes, and interview depth.';
  return 'Standard mode: balanced concept, code, debugging, and interview preparation.';
}

function mdBullets(items: string[], hinglish: boolean) {
  return items.map(item => `- ${hinglish ? softenForHinglish(item) : item}`).join('\n');
}

function mdNumbers(items: string[], hinglish: boolean) {
  return items.map((item, index) => `${index + 1}. ${hinglish ? softenForHinglish(item) : item}`).join('\n');
}

function softenForHinglish(line: string) {
  return line
    .replace(/^Do not /, 'Ye mat karo ke ')
    .replace(/^If /, 'Agar ');
}

function comparisonTable(rows: ComparisonRow[] | undefined, hinglish: boolean) {
  if (!rows?.length) return '';
  const [head, ...body] = rows;
  const header = `| ${head[0]} | ${head[1]} | ${head[2]} |\n| --- | --- | --- |`;
  const lines = body.map(row => `| ${row[0]} | ${hinglish ? softenForHinglish(row[1]) : row[1]} | ${hinglish ? softenForHinglish(row[2]) : row[2]} |`);
  return `${header}\n${lines.join('\n')}`;
}

function relatedTopics(catalogHit: ReturnType<typeof findCatalogTopic>) {
  return catalogHit?.section.topics
    .filter(item => item.id !== catalogHit.topic.id)
    .slice(0, 8)
    .map(item => item.title) || [];
}

function sourceReferenceBlock(catalogHit: ReturnType<typeof findCatalogTopic>, hinglish: boolean) {
  const refs = catalogHit?.topic.sourceRefs || [];
  if (!refs.length) {
    return hinglish
      ? `- ${javaOfflineCatalog.sourceName}: ${catalogHit?.topic.sourceUrl || javaOfflineCatalog.sourceUrl}`
      : `- ${javaOfflineCatalog.sourceName}: ${catalogHit?.topic.sourceUrl || javaOfflineCatalog.sourceUrl}`;
  }

  return refs
    .slice(0, 3)
    .map(ref => `- ${ref.sourceName}: [${ref.title}](${ref.url})`)
    .join('\n');
}

function sourceOutlineItems(catalogHit: ReturnType<typeof findCatalogTopic>) {
  const refs = catalogHit?.topic.sourceRefs || [];
  const items: string[] = [];
  const seen = new Set<string>();

  for (const ref of refs) {
    for (const heading of ref.outline || []) {
      const clean = heading.replace(/\s+/g, ' ').trim();
      const key = normalize(clean);
      if (!clean || !key || seen.has(key)) continue;
      seen.add(key);
      const sourceLabel = ref.sourceId === 'geeksforgeeks'
        ? 'GFG'
        : ref.sourceId === 'tutorialspoint'
        ? 'Tutorialspoint'
        : 'TpointTech';
      items.push(`${clean} (${sourceLabel})`);
    }
  }

  return items.slice(0, 14);
}

function sourceOutlineBlock(catalogHit: ReturnType<typeof findCatalogTopic>, hinglish: boolean) {
  const items = sourceOutlineItems(catalogHit);
  if (!items.length) {
    return hinglish
      ? '- Source headings available nahi thay, isliye lesson curriculum topic map aur original Zynapse notes se built hai.'
      : '- Source headings were unavailable, so this lesson is built from the curriculum topic map and original Zynapse notes.';
  }

  return items.map(item => `- ${item}`).join('\n');
}

function coveragePlanFromOutlines(catalogHit: ReturnType<typeof findCatalogTopic>, group: JavaGroup, title: string, hinglish: boolean) {
  const items = sourceOutlineItems(catalogHit).map(item => item.replace(/\s+\([^()]+\)$/g, ''));
  const selected = items.slice(0, 6);
  const fallback = [
    title,
    'definition',
    'working example',
    'common mistakes',
    'debugging',
    'interview preparation',
  ];
  const coverage = selected.length ? selected : fallback;
  const groupFocus = {
    basics: hinglish ? 'syntax, compile/run flow, aur beginner mistakes' : 'syntax, compile/run flow, and beginner mistakes',
    oops: hinglish ? 'class design, state, behavior, aur reusability' : 'class design, state, behavior, and reusability',
    arrays: hinglish ? 'indexing, boundaries, traversal, aur data storage' : 'indexing, boundaries, traversal, and data storage',
    strings: hinglish ? 'immutability, comparison, methods, aur performance' : 'immutability, comparison, methods, and performance',
    exceptions: hinglish ? 'failure flow, recovery, stack traces, aur cleanup' : 'failure flow, recovery, stack traces, and cleanup',
    concurrency: hinglish ? 'threads, shared state, lifecycle, aur safety' : 'threads, shared state, lifecycle, and safety',
    io: hinglish ? 'resources, streams, files, aur cleanup' : 'resources, streams, files, and cleanup',
    collections: hinglish ? 'data structure choice, operations, equality, aur performance' : 'data structure choice, operations, equality, and performance',
    jdbc: hinglish ? 'connection flow, SQL safety, ResultSet, aur transactions' : 'connection flow, SQL safety, ResultSet, and transactions',
    memory: hinglish ? 'stack/heap, reachability, GC, aur leaks' : 'stack/heap, reachability, GC, and leaks',
    networking: hinglish ? 'clients, servers, protocols, timeouts, aur failures' : 'clients, servers, protocols, timeouts, and failures',
    quizzes: hinglish ? 'revision, weak spots, aur explanation quality' : 'revision, weak spots, and explanation quality',
    core: hinglish ? 'definition, example, debugging, aur real use' : 'definition, example, debugging, and real use',
  } satisfies Record<JavaGroup, string>;

  const intro = hinglish
    ? `Is topic ko source headings ke checklist se cover karenge, lekin wording original hogi. Focus: ${groupFocus[group]}.`
    : `This topic is covered using source headings as a checklist, but the explanation is original. Focus: ${groupFocus[group]}.`;

  return `${intro}\n${coverage.map((item, index) => `${index + 1}. ${item}`).join('\n')}`;
}

function deepDiveFor(group: JavaGroup, title: string, hinglish: boolean) {
  const english: Record<JavaGroup, string[]> = {
    basics: [
      `Start ${title} by separating syntax from runtime behavior: syntax is what the compiler accepts, runtime behavior is what the JVM does after compilation.`,
      'Every beginner Java topic should be tested with a tiny source file, because Java error messages become much easier after you see the edit-compile-run loop.',
      'Connect the topic to types, variables, expressions, and control flow because most beginner bugs are a mix of those four ideas.',
      'A good test of understanding is whether you can predict the output before running the code.',
    ],
    oops: [
      `${title} should be learned as design behavior, not only syntax. Ask what responsibility belongs to the class and what state must be protected.`,
      'The strongest OOP code keeps object invariants valid: outside code should not be able to put an object into a broken state.',
      'Inheritance is useful only when the child can safely replace the parent. Otherwise composition is usually cleaner.',
      'Polymorphism matters because callers can depend on a stable contract while concrete classes provide different implementations.',
    ],
    arrays: [
      `${title} is mainly about indexed storage. The important mental habit is checking boundaries before accessing data.`,
      'Arrays are fast because the JVM can calculate an element location from base address plus index, but fixed size makes growth awkward.',
      'Use arrays when size is known or performance/layout matters; use collections when the data grows and shrinks often.',
      'For nested arrays, never assume every row has the same length unless your code created it that way.',
    ],
    strings: [
      `${title} is about text plus immutability. Most String bugs come from comparing references, ignoring nulls, or assuming methods mutate the original.`,
      'String literals, pooling, immutability, and equals/hashCode make String safe and useful as a Map key.',
      'StringBuilder is the practical tool when text is built repeatedly inside loops.',
      'For user input, normalize whitespace/case deliberately instead of comparing raw text blindly.',
    ],
    exceptions: [
      `${title} is about failure design. A good exception tells the caller what failed and preserves enough context to fix it.`,
      'Use exceptions for abnormal situations, not for normal branching that happens every few lines.',
      'Checked exceptions communicate recoverable external failure; unchecked exceptions often signal invalid arguments or programming mistakes.',
      'The stack trace is a map. Start at the first line that points to your own code.',
    ],
    concurrency: [
      `${title} requires thinking about timing. Code that works once can fail later if shared state is not protected.`,
      'Concurrency problems often come from visibility, atomicity, ordering, and lifecycle issues.',
      'Prefer immutable data, local variables, queues, executors, and high-level utilities before manual wait/notify logic.',
      'Always design cancellation and shutdown, otherwise background work can keep an app alive or corrupt state.',
    ],
    io: [
      `${title} is about crossing a boundary between your JVM and the outside world: disk, console, stream, socket, or another process.`,
      'External resources can fail because of paths, permissions, encoding, partial reads, locks, or unavailable devices.',
      'Use try-with-resources so cleanup is tied to the code block and does not depend on memory cleanup.',
      'For large files, streaming is safer than loading everything into memory.',
    ],
    collections: [
      `${title} should be chosen by behavior: order, uniqueness, lookup by key, sorting, queueing, and mutation cost.`,
      'Most collection bugs come from wrong assumptions about ordering, duplicate handling, equality, or concurrent modification.',
      'Generics are part of collection safety. They move many type mistakes from runtime to compile time.',
      'When performance matters, compare expected operation cost: lookup, insert, remove, iteration, and sort.',
    ],
    jdbc: [
      `${title} sits between Java objects and relational data. The hard part is not only connecting; it is doing SQL safely and closing resources.`,
      'PreparedStatement should be the default for user values because it separates SQL shape from data.',
      'Transactions matter whenever multiple database changes must succeed or fail together.',
      'In production, direct DriverManager code is usually replaced by a DataSource and connection pool.',
    ],
    memory: [
      `${title} is about object lifetime. Java removes manual free, but it does not remove responsibility for reference management.`,
      'The stack is tied to method calls; the heap stores objects reachable from running code, static fields, threads, and other roots.',
      'A memory leak in Java usually means reachable-but-unwanted objects are still referenced.',
      'GC tuning should come after measuring allocation rate, pause behavior, and heap usage.',
    ],
    networking: [
      `${title} is about unreliable communication. The network can be slow, down, partial, duplicated, or hostile.`,
      'Timeouts, retries, status-code handling, validation, and safe logging are part of correct network code.',
      'Raw sockets teach fundamentals, but real applications usually use HTTP clients or frameworks.',
      'Never trust remote data until it has been parsed, validated, and bounded.',
    ],
    quizzes: [
      `${title} is for checking understanding through output prediction, debugging, short code, and scenario questions.`,
      'A strong quiz answer explains why wrong options are wrong.',
      'Use missed questions as a revision map.',
      'Re-run related code after each wrong answer.',
    ],
    core: [
      `${title} should be tied back to Java syntax, JVM behavior, standard libraries, and practical debugging.`,
      'For any unfamiliar Java concept, learn definition, minimal example, failure case, and real use case.',
      'Good self-study means writing code, reading errors, and explaining the topic in your own words.',
      'Use source references as a checklist, but keep your app content original and practice-focused.',
    ],
  };

  const roman: Record<JavaGroup, string[]> = {
    basics: [
      `${title} me pehle syntax aur runtime behavior alag samjho: compiler kya accept karta hai, aur JVM run time pe kya karta hai.`,
      'Har beginner Java topic ko chhoti .java file me run karo, warna error messages abstract lagte rahenge.',
      'Is topic ko types, variables, expressions, aur control flow se connect karo, kyun ke beginner bugs aksar inhi ka mix hotay hain.',
      'Agar tum output run karne se pehle predict kar sakte ho, concept kaafi clear hai.',
    ],
    oops: [
      `${title} ko sirf syntax nahi, design responsibility ke angle se samjho: class kya represent kar rahi hai aur state kaise protect hogi.`,
      'Strong OOP code object ko invalid state me jane se rokta hai.',
      'Inheritance tab use karo jab child class genuinely parent ki jagah use ho sakti ho; warna composition cleaner hoti hai.',
      'Polymorphism ka benefit yeh hai ke caller contract pe depend karta hai, implementation change ho sakti hai.',
    ],
    arrays: [
      `${title} indexed storage ka topic hai. Sab se important habit boundaries check karna hai.`,
      'Arrays fast hoti hain kyun ke index se element location directly calculate hoti hai, lekin fixed size growth ko awkward banata hai.',
      'Size known ho to array, data grow/shrink hota rahe to collection better hoti hai.',
      'Nested arrays me assume mat karo ke har row same length ki hai.',
    ],
    strings: [
      `${title} text aur immutability ka topic hai. Common bugs == comparison, null handling, aur original String mutate samajhne se aate hain.`,
      'String literals, pooling, immutability, equals/hashCode String ko Map key ke liye useful banate hain.',
      'Loop me bar bar text build karna ho to StringBuilder practical choice hai.',
      'User input compare karne se pehle whitespace/case normalization ka decision clear rakho.',
    ],
    exceptions: [
      `${title} failure design ka topic hai. Good exception batati hai kya fail hua aur fix ke liye context deti hai.`,
      'Exceptions ko normal branching ke liye use mat karo.',
      'Checked exceptions external recoverable failure show karte hain; unchecked exceptions aksar invalid argument ya programming mistake hoti hain.',
      'Stack trace map jaisi hoti hai. Pehli line dhundo jo tumhare code ki file/line dikha rahi ho.',
    ],
    concurrency: [
      `${title} timing ka topic hai. Code ek dafa sahi chal jaye to bhi shared state unsafe ho sakti hai.`,
      'Concurrency bugs visibility, atomicity, ordering, aur lifecycle se nikalte hain.',
      'Manual wait/notify se pehle immutable data, local variables, queues, executors, aur high-level utilities prefer karo.',
      'Cancellation aur shutdown design karo, warna background work app ko stuck ya state ko corrupt kar sakta hai.',
    ],
    io: [
      `${title} JVM aur outside world ke beech boundary cross karta hai: disk, console, stream, socket, ya process.`,
      'External resources path, permission, encoding, partial read, lock, ya unavailable device ki wajah se fail ho sakte hain.',
      'try-with-resources use karo taake cleanup block ke end pe reliably ho.',
      'Large files ke liye streaming safer hai, full file memory me load karna risky ho sakta hai.',
    ],
    collections: [
      `${title} behavior ke hisaab se choose hota hai: order, uniqueness, key lookup, sorting, queueing, mutation cost.`,
      'Collection bugs aksar ordering, duplicate handling, equality, ya concurrent modification assumptions se aate hain.',
      'Generics collection safety ka part hain; type mistakes compile time pe catch hoti hain.',
      'Performance matter kare to lookup, insert, remove, iteration, aur sort cost compare karo.',
    ],
    jdbc: [
      `${title} Java objects aur relational database ke beech bridge hai. Sirf connect karna enough nahi; SQL safe aur resources close hone chahiye.`,
      'User values ke liye PreparedStatement default rakho kyun ke SQL shape aur data separate rehte hain.',
      'Multiple DB changes ek unit hon to transaction commit/rollback zaroor samjho.',
      'Production me DriverManager ke bajaye DataSource/connection pool common hota hai.',
    ],
    memory: [
      `${title} object lifetime ka topic hai. Java manual free remove karta hai, lekin references manage karna abhi bhi zaroori hai.`,
      'Stack method calls se tied hai; heap objects running code, static fields, threads aur roots se reachable rehte hain.',
      'Java memory leak ka matlab aksar reachable-but-unwanted objects hota hai.',
      'GC tuning measurement ke baad karo: allocation rate, pauses, aur heap usage dekho.',
    ],
    networking: [
      `${title} unreliable communication ka topic hai. Network slow, down, partial, duplicate, ya hostile ho sakta hai.`,
      'Timeouts, retries, status codes, validation, aur safe logging correct network code ka part hain.',
      'Raw sockets fundamentals sikha dete hain, lekin apps me HTTP clients/frameworks common hote hain.',
      'Remote data ko parse, validate, aur bound kiye baghair trust mat karo.',
    ],
    quizzes: english.quizzes,
    core: english.core,
  };

  return hinglish ? roman[group] : english[group];
}

function usageTable(group: JavaGroup, title: string, hinglish: boolean) {
  const rows: Record<JavaGroup, [string, string, string][]> = {
    basics: [
      ['Use', `Use ${title} when writing the foundation of any Java program.`, 'It keeps syntax and control flow correct.'],
      ['Avoid', 'Do not rush into frameworks before the basics are predictable.', 'Framework errors become impossible to debug without fundamentals.'],
    ],
    oops: [
      ['Use', `Use ${title} when it improves class responsibility and object behavior.`, 'It makes code easier to extend and reason about.'],
      ['Avoid', 'Avoid forced inheritance or public mutable fields.', 'They create fragile designs.'],
    ],
    arrays: [
      ['Use', `Use ${title} when indexed access and fixed-size data make sense.`, 'Arrays are simple and fast.'],
      ['Avoid', 'Avoid arrays for constantly resizing business data.', 'Collections usually fit changing data better.'],
    ],
    strings: [
      ['Use', `Use ${title} for text processing, validation, formatting, and display.`, 'Text is everywhere in real apps.'],
      ['Avoid', 'Avoid repeated String concatenation in hot loops.', 'It can create unnecessary objects.'],
    ],
    exceptions: [
      ['Use', `Use ${title} for abnormal failures and clear recovery paths.`, 'It keeps failure handling explicit.'],
      ['Avoid', 'Avoid empty catch blocks.', 'They hide bugs and make production issues painful.'],
    ],
    concurrency: [
      ['Use', `Use ${title} when tasks can overlap safely or responsiveness matters.`, 'It can improve throughput and responsiveness.'],
      ['Avoid', 'Avoid shared mutable state without coordination.', 'It causes race conditions.'],
    ],
    io: [
      ['Use', `Use ${title} for file, stream, and external resource operations.`, 'Apps need reliable input/output.'],
      ['Avoid', 'Avoid loading unknown large files fully into memory.', 'It can crash or slow the app.'],
    ],
    collections: [
      ['Use', `Use ${title} when storing groups of objects with known access patterns.`, 'The right collection simplifies code.'],
      ['Avoid', 'Avoid choosing a collection only by habit.', 'Wrong data structures create slow or buggy code.'],
    ],
    jdbc: [
      ['Use', `Use ${title} for relational database access from Java.`, 'It is the standard low-level database API.'],
      ['Avoid', 'Avoid concatenating SQL with user input.', 'It creates SQL injection risk.'],
    ],
    memory: [
      ['Use', `Use ${title} knowledge when debugging leaks, pauses, or object lifecycle issues.`, 'Production JVMs need memory awareness.'],
      ['Avoid', 'Avoid guessing GC/memory fixes without measurement.', 'Wrong tuning can make things worse.'],
    ],
    networking: [
      ['Use', `Use ${title} for communication between programs and services.`, 'Distributed systems rely on network correctness.'],
      ['Avoid', 'Avoid network calls without timeouts.', 'Requests can hang indefinitely.'],
    ],
    quizzes: [
      ['Use', `Use ${title} after studying a section.`, 'It reveals weak spots.'],
      ['Avoid', 'Avoid memorizing answers without running code.', 'It creates shallow confidence.'],
    ],
    core: [
      ['Use', `Use ${title} when it appears in code, docs, debugging, or interviews.`, 'It fills a practical Java knowledge gap.'],
      ['Avoid', 'Avoid one-line memorization.', 'Java topics need runnable verification.'],
    ],
  };

  const selected = rows[group];
  const header = hinglish
    ? '| Case | Guidance | Reason |\n| --- | --- | --- |'
    : '| Case | Guidance | Reason |\n| --- | --- | --- |';
  return `${header}\n${selected.map(row => `| ${row[0]} | ${row[1]} | ${row[2]} |`).join('\n')}`;
}

function productionNotesFor(group: JavaGroup, hinglish: boolean) {
  const english: Record<JavaGroup, string[]> = {
    basics: ['Keep code readable before making it clever.', 'Compiler warnings and errors are learning signals.', 'Small examples should grow into tested methods.'],
    oops: ['Protect invariants with private fields and validation.', 'Use interfaces for stable contracts.', 'Prefer composition when inheritance does not model a true is-a relationship.'],
    arrays: ['Validate indexes and input sizes.', 'Prefer collections for API boundaries unless arrays are required.', 'Avoid unnecessary copying in hot paths.'],
    strings: ['Normalize input deliberately.', 'Be careful with nulls from external systems.', 'Use StringBuilder for repeated mutation.'],
    exceptions: ['Log useful context without leaking secrets.', 'Do not catch what you cannot handle.', 'Preserve causes when wrapping exceptions.'],
    concurrency: ['Use bounded pools and explicit shutdown.', 'Avoid data races with immutable data or synchronization.', 'Test under load, not only once.'],
    io: ['Close resources reliably.', 'Handle permissions and missing paths.', 'Stream large data instead of loading everything.'],
    collections: ['Choose implementations by access pattern.', 'Use immutable views where mutation is not allowed.', 'Know equality rules for keys and set elements.'],
    jdbc: ['Use connection pooling.', 'Keep credentials server-side.', 'Use transactions and PreparedStatement for writes.'],
    memory: ['Use profilers and heap dumps.', 'Bound caches.', 'Watch static references and listeners.'],
    networking: ['Set connect/read timeouts.', 'Retry only idempotent or carefully designed operations.', 'Never log tokens or passwords.'],
    quizzes: ['Review explanations after each miss.', 'Turn weak questions into flashcards.', 'Re-test after revision.'],
    core: ['Keep examples reproducible.', 'Document assumptions.', 'Connect the topic to real debugging symptoms.'],
  };
  const roman: Record<JavaGroup, string[]> = {
    basics: ['Readable code ko clever code pe prefer karo.', 'Compiler warnings/errors learning signal hain.', 'Small examples ko tested methods tak grow karo.'],
    oops: ['Private fields aur validation se invariants protect karo.', 'Stable contract ke liye interfaces use karo.', 'Inheritance true is-a relation na ho to composition prefer karo.'],
    arrays: ['Indexes aur input sizes validate karo.', 'API boundaries pe collections usually better hoti hain.', 'Hot paths me unnecessary copying avoid karo.'],
    strings: ['Input normalization deliberate rakho.', 'External systems se null aa sakta hai.', 'Repeated mutation ke liye StringBuilder use karo.'],
    exceptions: ['Useful context log karo, secrets leak mat karo.', 'Jo handle nahi kar sakte woh catch mat karo.', 'Exception wrap karte waqt cause preserve karo.'],
    concurrency: ['Bounded pools aur explicit shutdown use karo.', 'Data races ko immutable data ya synchronization se avoid karo.', 'Load me test karo, sirf ek run pe trust mat karo.'],
    io: ['Resources reliably close karo.', 'Permissions aur missing paths handle karo.', 'Large data stream karo, full memory load mat karo.'],
    collections: ['Access pattern ke hisaab se implementation choose karo.', 'Mutation allowed na ho to immutable views use karo.', 'Keys/set elements ke equality rules clear rakho.'],
    jdbc: ['Connection pooling use karo.', 'Credentials server-side rakho.', 'Writes ke liye transactions aur PreparedStatement use karo.'],
    memory: ['Profilers aur heap dumps use karo.', 'Caches ko bounded rakho.', 'Static references aur listeners check karo.'],
    networking: ['Connect/read timeouts set karo.', 'Retries carefully design karo.', 'Tokens/passwords log mat karo.'],
    quizzes: ['Har miss ke baad explanation revise karo.', 'Weak questions ko flashcards me convert karo.', 'Revision ke baad re-test karo.'],
    core: ['Examples reproducible rakho.', 'Assumptions document karo.', 'Topic ko real debugging symptoms se connect karo.'],
  };
  return mdBullets(hinglish ? roman[group] : english[group], false);
}

function miniProjectFor(group: JavaGroup, title: string, hinglish: boolean) {
  const english: Record<JavaGroup, string> = {
    basics: `Build a console program that demonstrates ${title}, prints expected output, and includes one intentional mistake you can fix.`,
    oops: `Model a small Student/Course or BankAccount system using ${title}; include validation and at least two objects.`,
    arrays: `Create a marks analyzer that stores scores, prints min/max/average, and handles empty input safely.`,
    strings: `Build a username cleaner that trims input, validates length, normalizes case, and reports invalid values.`,
    exceptions: `Build a safe calculator that validates input and returns friendly errors without hiding the original cause.`,
    concurrency: `Create a small worker demo with two tasks, safe shared counting, and clean shutdown.`,
    io: `Build a notes file tool that creates, writes, reads, and deletes a file with clear error handling.`,
    collections: `Build a word-frequency counter using the collection that best fits lookup and counting.`,
    jdbc: `Design a user repository pseudo-implementation using PreparedStatement and transaction boundaries.`,
    memory: `Draw and explain stack/heap references for a tiny object graph, then identify what keeps objects reachable.`,
    networking: `Build a small HTTP GET example with timeout, status-code handling, and safe error output.`,
    quizzes: `Create a 10-question revision sheet and explain why each correct answer is correct.`,
    core: `Create a tiny runnable example for ${title}, then add one failing case and one fix.`,
  };
  const roman: Record<JavaGroup, string> = {
    basics: `${title} demonstrate karne wala console program banao, expected output print karo, aur ek intentional mistake fix karo.`,
    oops: `${title} use karke Student/Course ya BankAccount model banao; validation aur at least two objects include karo.`,
    arrays: 'Marks analyzer banao jo scores store kare, min/max/average print kare, aur empty input safely handle kare.',
    strings: 'Username cleaner banao jo trim, length validation, case normalization, aur invalid report kare.',
    exceptions: 'Safe calculator banao jo input validate kare aur friendly errors de without original cause hide kiye.',
    concurrency: 'Two tasks, safe shared counter, aur clean shutdown ke saath worker demo banao.',
    io: 'Notes file tool banao jo create, write, read, delete kare aur errors clearly handle kare.',
    collections: 'Word-frequency counter banao jisme lookup/counting ke liye best collection choose ho.',
    jdbc: 'PreparedStatement aur transaction boundaries ke saath user repository pseudo-implementation design karo.',
    memory: 'Tiny object graph ka stack/heap diagram banao aur explain karo objects reachable kyun hain.',
    networking: 'Timeout, status code handling, aur safe error output ke saath HTTP GET example banao.',
    quizzes: '10-question revision sheet banao aur har correct answer ka reason explain karo.',
    core: `${title} ka tiny runnable example banao, phir ek failing case aur fix add karo.`,
  };
  return hinglish ? roman[group] : english[group];
}

function cheatSheetFor(profile: JavaTopicProfile, group: JavaGroup, title: string, hinglish: boolean) {
  const rows = [
    ['Definition', profile.definition],
    ['Main idea', profile.mentalModel],
    ['Watch out', profile.mistakes[0] || `Do not memorize ${title} without code.`],
    ['Practice', profile.practice[0] || `Write a small example for ${title}.`],
  ];
  const header = hinglish
    ? '| Item | Notes |\n| --- | --- |'
    : '| Item | Notes |\n| --- | --- |';
  const groupNote = hinglish
    ? `${group} category ka focus: code run karo, error read karo, aur concept apni wording me explain karo.`
    : `${group} category focus: run code, read errors, and explain the concept in your own words.`;
  return `${header}\n${rows.map(row => `| ${row[0]} | ${row[1].replace(/\|/g, '/')} |`).join('\n')}\n\n${groupNote}`;
}

function interviewQaFor(profile: JavaTopicProfile, group: JavaGroup, title: string, hinglish: boolean) {
  const subject = title.replace(/^what\s+is\s+/i, '').replace(/\?$/g, '').trim() || title;
  const qa = [
    {
      q: `What is ${subject}?`,
      a: profile.definition,
    },
    {
      q: `Why does ${subject} matter in Java projects?`,
      a: `${profile.why[0] || `${title} appears in real Java code.`} ${profile.why[1] || ''}`.trim(),
    },
    {
      q: `What is the most common mistake with ${subject}?`,
      a: `${profile.mistakes[0] || 'The most common mistake is learning the definition without running code.'} Fix it by using this debugging habit: ${profile.debugging[0] || 'reduce the code to a tiny reproducible example.'}`,
    },
    {
      q: `How should a senior engineer approach ${subject}?`,
      a: `${profile.bestPractices[0] || 'Keep the code clear and testable.'} Also consider the production angle for ${group}: performance, failure behavior, maintainability, and debugging.`,
    },
    {
      q: `How do you practice ${subject} properly?`,
      a: `${profile.practice[0] || `Write a small example for ${title}.`} Then modify it, break it intentionally, read the error, and fix it without guessing.`,
    },
  ];

  if (hinglish) {
    return qa.map((item, index) => `**Q${index + 1}. ${item.q}**\n\n${item.a}`).join('\n\n');
  }

  return qa.map((item, index) => `**Q${index + 1}. ${item.q}**\n\n${item.a}`).join('\n\n');
}

function selfCheckFor(group: JavaGroup, title: string, hinglish: boolean) {
  const english: Record<JavaGroup, string[]> = {
    basics: [
      `Can you write a minimal program that demonstrates ${title}?`,
      'Can you explain which errors are compile-time errors?',
      'Can you predict output before running?',
    ],
    oops: [
      'Can you identify fields, methods, constructor, and responsibility?',
      'Can you explain whether inheritance or composition is better here?',
      'Can you protect object state from invalid changes?',
    ],
    arrays: [
      'Can you explain valid index range?',
      'Can you traverse the data without off-by-one errors?',
      'Can you decide between array and ArrayList?',
    ],
    strings: [
      'Can you compare content correctly?',
      'Can you explain immutability?',
      'Can you choose between String, StringBuilder, and StringBuffer?',
    ],
    exceptions: [
      'Can you identify the risky operation?',
      'Can you preserve useful error context?',
      'Can you decide where recovery should happen?',
    ],
    concurrency: [
      'Can you identify shared mutable state?',
      'Can you explain why run() and start() are different?',
      'Can you shut down work cleanly?',
    ],
    io: [
      'Can you choose text vs byte APIs?',
      'Can you close resources safely?',
      'Can you handle missing files and permissions?',
    ],
    collections: [
      'Can you choose List, Set, Map, Queue, or Deque?',
      'Can you explain equality and ordering rules?',
      'Can you state the expected operation cost?',
    ],
    jdbc: [
      'Can you explain the connection -> statement -> result flow?',
      'Can you use PreparedStatement safely?',
      'Can you define transaction boundaries?',
    ],
    memory: [
      'Can you draw stack and heap references?',
      'Can you explain reachability?',
      'Can you identify a likely leak source?',
    ],
    networking: [
      'Can you set timeouts?',
      'Can you handle status codes and failures?',
      'Can you avoid logging secrets?',
    ],
    quizzes: [
      'Can you explain why the correct answer is correct?',
      'Can you fix the topic behind every wrong answer?',
      'Can you retest after revision?',
    ],
    core: [
      `Can you explain ${title} in your own words?`,
      'Can you show a minimal example?',
      'Can you debug one failing case?',
    ],
  };

  const roman: Record<JavaGroup, string[]> = {
    basics: [
      `${title} demonstrate karne wala minimal program likh sakte ho?`,
      'Compile-time errors explain kar sakte ho?',
      'Run se pehle output predict kar sakte ho?',
    ],
    oops: [
      'Fields, methods, constructor, aur responsibility identify kar sakte ho?',
      'Inheritance ya composition me se better choice explain kar sakte ho?',
      'Object state invalid changes se protect kar sakte ho?',
    ],
    arrays: [
      'Valid index range explain kar sakte ho?',
      'Off-by-one bug ke baghair traverse kar sakte ho?',
      'Array aur ArrayList me decision le sakte ho?',
    ],
    strings: [
      'Content comparison correctly kar sakte ho?',
      'Immutability explain kar sakte ho?',
      'String, StringBuilder, StringBuffer me choice kar sakte ho?',
    ],
    exceptions: [
      'Risky operation identify kar sakte ho?',
      'Useful error context preserve kar sakte ho?',
      'Recovery kahan honi chahiye decide kar sakte ho?',
    ],
    concurrency: [
      'Shared mutable state identify kar sakte ho?',
      'run() aur start() ka difference explain kar sakte ho?',
      'Work cleanly shutdown kar sakte ho?',
    ],
    io: [
      'Text vs byte APIs choose kar sakte ho?',
      'Resources safely close kar sakte ho?',
      'Missing files aur permissions handle kar sakte ho?',
    ],
    collections: [
      'List, Set, Map, Queue, Deque me se choose kar sakte ho?',
      'Equality aur ordering rules explain kar sakte ho?',
      'Operation cost state kar sakte ho?',
    ],
    jdbc: [
      'Connection -> statement -> result flow explain kar sakte ho?',
      'PreparedStatement safely use kar sakte ho?',
      'Transaction boundaries define kar sakte ho?',
    ],
    memory: [
      'Stack aur heap references draw kar sakte ho?',
      'Reachability explain kar sakte ho?',
      'Likely leak source identify kar sakte ho?',
    ],
    networking: [
      'Timeouts set kar sakte ho?',
      'Status codes aur failures handle kar sakte ho?',
      'Secrets logging avoid kar sakte ho?',
    ],
    quizzes: [
      'Correct answer correct kyun hai explain kar sakte ho?',
      'Har wrong answer ke peeche topic fix kar sakte ho?',
      'Revision ke baad retest kar sakte ho?',
    ],
    core: [
      `${title} apni wording me explain kar sakte ho?`,
      'Minimal example dikha sakte ho?',
      'Ek failing case debug kar sakte ho?',
    ],
  };

  return mdBullets(hinglish ? roman[group] : english[group], false);
}

function buildJavaOfflineQuiz(title: string, language: string, difficulty: Difficulty, reason?: string) {
  const hinglish = isHinglish(language);
  const intro = hinglish
    ? `> Offline Quiz Mode: AI/API abhi unavailable ya rate-limited hai. Reason: ${reason || 'provider unavailable'}`
    : `> Offline Quiz Mode: AI/API providers are unavailable or rate-limited. Reason: ${reason || 'provider unavailable'}`;

  const questions = [
    ['What does JVM execute?', 'Java bytecode'],
    ['Which method is the Java entry point?', 'public static void main(String[] args)'],
    ['Should String content be compared with == or equals()?', 'Use equals() for content comparison.'],
    ['What happens if a public class name differs from the file name?', 'Compilation fails.'],
    ['Which collection stores key-value pairs?', 'Map, commonly HashMap.'],
    ['Why use PreparedStatement?', 'To bind parameters safely and reduce SQL injection risk.'],
    ['What does synchronized protect?', 'A critical section or method from concurrent access by multiple threads on the same monitor.'],
    ['What is the base case in recursion?', 'The condition that stops recursive calls.'],
    ['What is the difference between throw and throws?', 'throw raises an exception; throws declares possible exceptions in a method signature.'],
    ['Why can ArrayList insertion in the middle be slow?', 'Elements after the insertion point may need to shift.'],
  ];

  return `# ${title}

${intro}

## ${hinglish ? 'Kaise Attempt Karna Hai' : 'How To Attempt'}
- ${difficultyDepth(difficulty, hinglish)}
- ${hinglish ? 'Pehle answer khud do, phir solution check karo.' : 'Answer first, then check the solution.'}
- ${hinglish ? 'Wrong answer ka matlab ye topic revise karna hai, bas.' : 'A wrong answer simply marks a topic to revise.'}

## ${hinglish ? 'Offline Practice Questions' : 'Offline Practice Questions'}
${questions.map(([question, answer], index) => `${index + 1}. **${question}**\n   - ${hinglish ? 'Answer' : 'Answer'}: ${answer}`).join('\n')}

## ${hinglish ? 'Next Revision Plan' : 'Next Revision Plan'}
1. ${hinglish ? 'Jis question me doubt tha us topic ko sidebar se open karo.' : 'Open the sidebar topic for every question you missed.'}
2. ${hinglish ? 'Ek chhota code example run karo.' : 'Run one small code example.'}
3. ${hinglish ? 'Phir quiz dobara attempt karo.' : 'Attempt the quiz again.'}`;
}

// ---------------------------------------------------------------------------
// Scraped content renderer
// ---------------------------------------------------------------------------

const HINGLISH_SECTION_INTROS = [
  'Ye section samjhata hai:',
  'Is part mein:',
  'Yahan detail mein dekho:',
  'Is concept ko samjho:',
  'Iska matlab hai:',
];

function renderScrapedSection(sec: ScrapedSection, hinglish: boolean): string {
  const lines: string[] = [];
  if (sec.heading) {
    if (hinglish) {
      const intro = HINGLISH_SECTION_INTROS[Math.abs(sec.heading.charCodeAt(0)) % HINGLISH_SECTION_INTROS.length];
      lines.push(`### ${sec.heading}\n> _${intro}_`);
    } else {
      lines.push(`### ${sec.heading}`);
    }
  }
  sec.paragraphs.forEach(p => { if (p.trim()) lines.push(p.trim()); });
  sec.code.forEach((c, i) => {
    if (c.trim()) {
      const codeLabel = hinglish ? `**Example Code ${i + 1}:**` : `**Example ${i + 1}:**`;
      lines.push(`${codeLabel}\n\`\`\`java\n${c.trim()}\n\`\`\``);
    }
  });
  return lines.join('\n\n');
}

function buildScrapedLesson(
  topicId: string,
  title: string,
  sectionTitle: string,
  difficulty: string,
  language: string,
  reason: string,
  profile: JavaTopicProfile,
  compare: string,
  related: string[],
): string {
  const hinglish = isHinglish(language);
  const scraped = getScrapedTopic(topicId);

  if (!scraped || scraped.sections.length === 0) return '';

  const sourceAttrib = `[${scraped.source}](${scraped.url})`;
  const sectionsMarkdown = scraped.sections
    .map(s => renderScrapedSection(s, hinglish))
    .filter(Boolean)
    .join('\n\n---\n\n');

  // Hinglish framing
  const H = {
    badge: hinglish
      ? '> **Offline Java Mode:** API unavailable ya rate-limited hai. Real scraped content se lesson banaya gaya hai.'
      : '> **Offline Java Mode:** API unavailable or rate-limited. Lesson built from real scraped tutorial content.',
    source: hinglish ? 'Scraped Source' : 'Content Source',
    goal: hinglish ? 'Seekhne ka Maqsad' : 'Learning Goal',
    definition: hinglish ? 'Definition' : 'Definition',
    mental: hinglish ? 'Mental Model' : 'Mental Model',
    why: hinglish ? 'Kyun Zaroori Hai' : 'Why It Matters',
    core: hinglish ? 'Core Concepts' : 'Core Concepts',
    content: hinglish ? 'Tutorial Content (Scraped)' : 'Tutorial Content (Scraped)',
    example: hinglish ? 'Runnable Example' : 'Runnable Example',
    interview: hinglish ? 'Interview Preparation' : 'Interview Preparation',
    practice: hinglish ? 'Practice Tasks' : 'Practice Tasks',
    related: hinglish ? 'Related Topics' : 'Related Topics',
    online: hinglish ? 'Online Enhancement' : 'Online Enhancement',
    goalText: hinglish
      ? `**${title}** ko samjho — definition, real scraped content, code, aur interview prep ke zariye.`
      : `Understand **${title}** — through definition, real scraped tutorial content, code, and interview prep.`,
    onlineText: hinglish
      ? 'Jab API available ho, same topic reload karo AI-generated examples ke liye. Offline mode mein bhi learning nahi rukti.'
      : 'When API becomes available, reload this topic for AI-generated extra examples. Offline mode keeps learning going even when limits are hit.',
  };

  const corePoints = profile.core.map(c => `- ${c}`).join('\n');
  const whyPoints = profile.why.map(w => `- ${w}`).join('\n');
  const interviewPoints = profile.interview.map(q => `- ${q}`).join('\n');
  const practicePoints = profile.practice.map((p, i) => `${i + 1}. ${p}`).join('\n');
  const relatedLine = related.length ? related.map(r => `- ${r}`).join('\n') : `- ${hinglish ? 'Sidebar ke previous/next topics revise karo.' : 'Review the previous and next sidebar topics.'}`;
  const compareSection = compare ? `\n## Comparison\n${compare}\n` : '';
  const codeSection = profile.example
    ? `\n## ${H.example}\n\`\`\`java\n${profile.example}\n\`\`\`\n`
    : '';

  return `# ${title}

${H.badge}

## ${H.goal}
- **Section:** ${sectionTitle}
- **Difficulty:** ${difficulty}
- ${H.goalText}
- **${H.source}:** ${sourceAttrib}

## ${H.definition}
${profile.definition}

## ${H.mental}
${profile.mentalModel}

## ${H.why}
${whyPoints}

## ${H.core}
${corePoints}
${compareSection}${codeSection}
---

## ${H.content}

> ${hinglish ? 'Neeche diya gaya content real tutorial websites se scrape kiya gaya hai.' : 'The content below is scraped from real tutorial websites.'}

${sectionsMarkdown}

---

## ${H.interview}
${interviewPoints}

## ${H.practice}
${practicePoints}

## ${H.related}
${relatedLine}

## ${H.online}
${H.onlineText}`;
}

export function buildJavaOfflineLesson({ topic, language, difficulty, reason }: JavaOfflineLessonInput) {
  const catalogHit = findCatalogTopic(topic);
  const topicId = topic.id || catalogHit?.topic.id || '';
  const title = topic.title || catalogHit?.topic.title || 'Java Topic';
  const group = javaGroup(topicId, title);
  const hinglish = isHinglish(language);

  if (group === 'quizzes') {
    return buildJavaOfflineQuiz(title, language, difficulty, reason);
  }

  const profile = topicProfile(topicId, title, group);
  const sourceUrl = catalogHit?.topic.sourceUrl || javaOfflineCatalog.sourceUrl;
  const sectionTitle = topic.sectionTitle || catalogHit?.section.title || 'Java Complete Syllabus';
  const related = relatedTopics(catalogHit);
  const compare = comparisonTable(profile.comparison, hinglish);

  // Use scraped content if available — richer than template
  const scrapedLesson = buildScrapedLesson(topicId, title, sectionTitle, difficulty, language, reason || '', profile, compare, related);
  if (scrapedLesson) return scrapedLesson;
  const sourceBlock = sourceReferenceBlock(catalogHit, hinglish);
  const sourceOutline = sourceOutlineBlock(catalogHit, hinglish);
  const coveragePlan = coveragePlanFromOutlines(catalogHit, group, title, hinglish);
  const deepDive = mdBullets(deepDiveFor(group, title, hinglish), false);
  const usage = usageTable(group, title, hinglish);
  const production = productionNotesFor(group, hinglish);
  const miniProject = miniProjectFor(group, title, hinglish);
  const cheatSheet = cheatSheetFor(profile, group, title, hinglish);
  const interviewQa = interviewQaFor(profile, group, title, hinglish);
  const selfCheck = selfCheckFor(group, title, hinglish);
  const extraSectionCount = (profile.syntax?.length ? 1 : 0) + (compare ? 1 : 0);
  const sectionNo = {
    workflow: 6 + extraSectionCount,
    example: 7 + extraSectionCount,
    walkthrough: 8 + extraSectionCount,
    mistakes: 9 + extraSectionCount,
    debugging: 10 + extraSectionCount,
    bestPractices: 11 + extraSectionCount,
    interview: 12 + extraSectionCount,
    practice: 13 + extraSectionCount,
    related: 14 + extraSectionCount,
    online: 15 + extraSectionCount,
  };

  if (hinglish) {
    return `# ${title}

> Offline Java Mode: AI/API abhi unavailable ya rate-limited hai, lekin yeh curated offline lesson complete usable hai. Reason: ${reason || 'provider unavailable'}

Source outline: ${javaOfflineCatalog.sourceName} (${sourceUrl})
Note: yeh original Zynapse offline notes hain. Tutorial body copy nahi ki gayi.

## Source Cross-Check
${sourceBlock}

## Source Outline Checklist
${sourceOutline}

## Original Coverage Plan
${coveragePlan}

## 1. Topic Goal
- Section: **${sectionTitle}**
- Mode: **${difficulty}**
- Depth: ${difficultyDepth(difficulty, true)}
- Goal: ${title} ko definition, code, debugging, aur interview angle se properly samajhna.

## 2. Simple Meaning
${profile.definition}

## 3. Mental Model
${profile.mentalModel}

## 4. Why It Matters
${mdBullets(profile.why, true)}

## 5. Core Concepts
${mdBullets(profile.core, true)}

## Deep Dive Notes
${deepDive}

${profile.syntax?.length ? `## 6. Syntax / Rules\n${profile.syntax.map(item => `- \`${item}\``).join('\n')}\n\n` : ''}${compare ? `## ${profile.syntax?.length ? '7' : '6'}. Comparison Table\n${compare}\n\n` : ''}## ${sectionNo.workflow}. Step-by-Step Workflow
${mdNumbers(profile.workflow, true)}

## ${sectionNo.example}. Runnable Example
\`\`\`${profile.example.trim().startsWith('#') ? '' : 'java'}
${profile.example}
\`\`\`

## ${sectionNo.walkthrough}. Code Walkthrough
${mdBullets(profile.walkthrough, true)}

## ${sectionNo.mistakes}. Common Mistakes
${mdBullets(profile.mistakes, true)}

## ${sectionNo.debugging}. Debugging Checklist
${mdBullets(profile.debugging, true)}

## ${sectionNo.bestPractices}. Best Practices
${mdBullets(profile.bestPractices, true)}

## Production Notes
${production}

## When To Use / Avoid
${usage}

## ${sectionNo.interview}. Interview Preparation
${mdBullets(profile.interview, true)}

## Interview Q&A With Answers
${interviewQa}

## ${sectionNo.practice}. Practice Tasks
${mdNumbers(profile.practice, true)}

## Self-Check
${selfCheck}

## Mini Project
${miniProject}

## Quick Cheat Sheet
${cheatSheet}

## ${sectionNo.related}. Related Topics
${related.length ? mdBullets(related, true) : '- Previous/next sidebar topics revise karo.'}

## ${sectionNo.online}. Online Enhancement
Jab Gemini/Groq/Ollama available ho, same topic reload karo for AI-generated extra examples. Offline mode ka aim hai ke API limit ke bawajood learning rukay nahi.`;
  }

  return `# ${title}

> Offline Java Mode: AI/API providers are unavailable or rate-limited, but this curated offline lesson is fully usable. Reason: ${reason || 'provider unavailable'}

Source outline: ${javaOfflineCatalog.sourceName} (${sourceUrl})
Note: these are original Zynapse offline notes. Tutorial body text is not copied.

## Source Cross-Check
${sourceBlock}

## Source Outline Checklist
${sourceOutline}

## Original Coverage Plan
${coveragePlan}

## 1. Learning Goal
- Section: **${sectionTitle}**
- Difficulty: **${difficulty}**
- Depth: ${difficultyDepth(difficulty, false)}
- Goal: understand **${title}** through definition, code, debugging, and interview preparation.

## 2. Definition
${profile.definition}

## 3. Mental Model
${profile.mentalModel}

## 4. Why It Matters
${mdBullets(profile.why, false)}

## 5. Core Concepts
${mdBullets(profile.core, false)}

## Deep Dive Notes
${deepDive}

${profile.syntax?.length ? `## 6. Syntax / Rules\n${profile.syntax.map(item => `- \`${item}\``).join('\n')}\n\n` : ''}${compare ? `## ${profile.syntax?.length ? '7' : '6'}. Comparison Table\n${compare}\n\n` : ''}## ${sectionNo.workflow}. Step-by-Step Workflow
${mdNumbers(profile.workflow, false)}

## ${sectionNo.example}. Runnable Example
\`\`\`${profile.example.trim().startsWith('#') ? '' : 'java'}
${profile.example}
\`\`\`

## ${sectionNo.walkthrough}. Code Walkthrough
${mdBullets(profile.walkthrough, false)}

## ${sectionNo.mistakes}. Common Mistakes
${mdBullets(profile.mistakes, false)}

## ${sectionNo.debugging}. Debugging Checklist
${mdBullets(profile.debugging, false)}

## ${sectionNo.bestPractices}. Best Practices
${mdBullets(profile.bestPractices, false)}

## Production Notes
${production}

## When To Use / Avoid
${usage}

## ${sectionNo.interview}. Interview Preparation
${mdBullets(profile.interview, false)}

## Interview Q&A With Answers
${interviewQa}

## ${sectionNo.practice}. Practice Tasks
${mdNumbers(profile.practice, false)}

## Self-Check
${selfCheck}

## Mini Project
${miniProject}

## Quick Cheat Sheet
${cheatSheet}

## ${sectionNo.related}. Related Topics
${related.length ? mdBullets(related, false) : '- Review the previous and next sidebar topics.'}

## ${sectionNo.online}. Online Enhancement
When Gemini/Groq/Ollama becomes available, reload the same topic for AI-generated extra examples. Offline mode keeps learning useful even when API limits are hit.`;
}
