export const interviewPlanContent = `
# 🚀 Rahool's Ultimate 2-Day Interview Crack Plan (Senior Edition)

**Interview Date:** Thursday, 16 April 2026, 12:00 PM (Pakistan Time)
**Target Role:** Senior Software Engineer (Java, Spring Boot, Microservices, Oracle)

---

## 🎯 The Senior Mindset: "How" and "Why"
Interviewer 4+ years ke candidate se sirf definitions nahi poochega. Wo poochega:
1. **Trade-offs:** "Kyun use kiya?" (e.g., Kafka vs RabbitMQ)
2. **Internal Working:** "Andar kya ho raha hai?" (e.g., HashMap internal, Bean Lifecycle)
3. **Resilience:** "System fail hua to kya karoge?" (e.g., Circuit Breaker, Saga)
4. **Optimization:** "Slow hai to fast kaise karoge?" (e.g., DB Indexing, Caching)

---

## ☕ 1. Advanced Java Core

### **1. Memory Management: Stack vs Heap**
*   **Stack:** Primitive types aur object references store karta hai. Har thread ka apna stack hota hai (Thread-safe).
*   **Heap:** Saare objects (new keywords se bane hue) yahan store hote hain. Shared memory hai.
*   **Real-World Scenario:** Agar tum loop mein millions of objects create kar rahe ho bina reference release kiye, to **OutOfMemoryError (Heap Space)** aayega. Agar recursion depth zyada hai, to **StackOverflowError** aayega.

### **2. Garbage Collection (GC)**
*   **Concept:** Unreachable objects ko heap se remove karna.
*   **Algorithms:** G1GC (default since Java 9), ZGC (low latency).
*   **Senior Tip:** "Stop-the-world" event kya hota hai? Jab GC chalta hai, application threads pause ho jate hain. ZGC isko minimize karta hai.

### **3. Java 8+ Mastery (Streams & Optional)**
*   **Streams:** Declarative data processing.
*   **Scenario:** *"Mere paas 10,000 transactions hain, mujhe sirf 'SUCCESS' status wale transactions ka sum chahiye."*
    \`\`\`java
    double total = list.stream()
        .filter(t -> "SUCCESS".equals(t.getStatus()))
        .mapToDouble(Transaction::getAmount)
        .sum();
    \`\`\`
*   **Optional:** NullPointerException se bachne ke liye. Never return null, return \`Optional.empty()\`.

### **4. Multithreading & Concurrency**
*   **CompletableFuture:** Asynchronous programming.
*   **Scenario:** *"Mujhe 3 different APIs se data fetch karna hai aur combine karna hai."*
    Use \`CompletableFuture.allOf()\` to run them in parallel and wait for all.
*   **ExecutorService:** Thread pool management. Kabhi bhi \`new Thread().start()\` mat karo production mein, hamesha thread pool use karo.

---

## 🌱 2. Deep Dive: Spring Boot & Frameworks

### **1. The Bean Lifecycle (Must Know!)**
1.  **Instantiation:** Bean object create hota hai.
2.  **Populate Properties:** Dependencies inject hoti hain (\`@Autowired\`).
3.  **BeanNameAware / BeanFactoryAware:** Spring internal interfaces call hote hain.
4.  **Pre-Initialization:** \`BeanPostProcessor.postProcessBeforeInitialization\`.
5.  **Initialization:** \`@PostConstruct\` ya \`InitializingBean.afterPropertiesSet\`.
6.  **Post-Initialization:** \`BeanPostProcessor.postProcessAfterInitialization\`.
7.  **Ready:** Bean use ke liye tayar hai.
8.  **Destruction:** \`@PreDestroy\` call hota hai jab context close ho.

### **2. Bean Scopes**
*   **Singleton (Default):** One instance per Spring Container.
*   **Prototype:** New instance every time requested.
*   **Web Scopes:** Request, Session, Application.

### **3. Transaction Management (@Transactional)**
*   **Propagation:**
    *   \`REQUIRED\` (Default): Existing transaction join karo, nahi hai to nayi banao.
    *   \`REQUIRES_NEW\`: Hamesha nayi transaction banao, purani suspend kar do.
*   **Isolation Levels:** Read Committed, Serializable, etc. (Oracle default is Read Committed).
*   **Scenario:** *"Agar main method A (Transactional) se method B (Transactional) call karoon aur B fail ho jaye, to kya A rollback hoga?"*
    Yes, because of \`REQUIRED\` propagation.

### **4. Spring Data JPA & Hibernate**
*   **N+1 Problem:** Jab 1 query parent ke liye aur N queries children ke liye chalein.
*   **Fix:** Use \`JOIN FETCH\` in JPQL or \`@EntityGraph\`.
*   **L1 vs L2 Cache:** L1 is Session level (default), L2 is SessionFactory level (needs config like Ehcache).

---

## 🧩 3. Microservices Architecture (Senior Level)

### **1. Inter-Service Communication**
*   **Feign Client:** Declarative REST client.
*   **Kafka/RabbitMQ:** Asynchronous/Event-driven.
*   **Scenario:** *"User ne order place kiya. Order service database update karegi aur Kafka pe message bhej degi. Inventory aur Email service us message ko consume karengi."* (Decoupling).

### **2. Saga Pattern (Distributed Transactions)**
*   **Choreography:** Services events exchange karti hain (No central coordinator).
*   **Orchestration:** Ek central "Orchestrator" batata hai kisko kya karna hai.
*   **Scenario:** Banking fund transfer. Service A deducts money -> Service B credits money. Agar B fail ho, to A ko "Compensating Transaction" (Refund) chalani hogi.

### **3. Resilience Patterns**
*   **Circuit Breaker (Resilience4j):** Agar Service B down hai, to Service A baar baar call karke threads waste nahi karegi. "Open" state mein fauran error return karegi.
*   **Rate Limiter:** API abuse rokne ke liye (e.g., 100 requests per min).

### **4. API Gateway (Spring Cloud Gateway)**
*   Central entry point.
*   Authentication, Routing, Logging, Rate Limiting yahan handle hote hain.

---

## 🗄️ 4. Oracle Database & Performance Tuning

### **1. Indexing Strategy**
*   **B-Tree Index:** Default, good for high cardinality (unique values).
*   **Bitmap Index:** Good for low cardinality (e.g., Gender, Status).
*   **Function-Based Index:** Agar query mein \`WHERE UPPER(name) = 'RAHOOL'\` hai, to \`UPPER(name)\` pe index chahiye.

### **2. Execution Plan (EXPLAIN PLAN)**
*   Query slow hai? Plan dekho.
*   **Full Table Scan:** Index missing hai.
*   **Index Range Scan:** Good.
*   **Nested Loops vs Hash Join:** Oracle kaise tables join kar raha hai.

### **3. PL/SQL: Procedures vs Functions**
*   **Function:** Must return a value. SQL query mein use ho sakta hai.
*   **Procedure:** Business logic ke liye. Multiple values return kar sakta hai (OUT params).
*   **Triggers:** Automatic actions on Insert/Update/Delete. (Use carefully, can slow down DB).

---

## 🛠️ 5. Real-World Scenario-Based Debugging

**Scenario 1: "CPU usage 100% ho gaya hai production mein. Kaise trace karoge?"**
1.  **Top Command:** Linux pe dekho kaunsa process le raha hai.
2.  **Thread Dump:** \`jstack\` use karke dekho kaunse threads "RUNNABLE" state mein hain aur kya code execute kar rahe hain.
3.  **GC Logs:** Check karo kahin excessive Garbage Collection to nahi ho raha (Memory Leak).

**Scenario 2: "Database connection pool exhausted error aa raha hai."**
1.  **Check Connections:** Kahin connections open to nahi chhor diye? (Always use try-with-resources).
2.  **Slow Queries:** Slow queries connections ko hold karke rakhti hain.
3.  **Pool Size:** \`hikari\` settings check karo (max-pool-size).

**Scenario 3: "Fintech App mein Double Spending problem kaise rokoge?"**
1.  **Database Level:** Use **Pessimistic Locking** (\`SELECT ... FOR UPDATE\`) ya **Optimistic Locking** (\`@Version\` in JPA).
2.  **Idempotency:** Har request ke sath ek \`request-id\` bhejenge. Agar same ID dobara aaye, to process nahi karenge.

---

## 🤝 6. HR & Leadership (Senior Role)

*   **Conflict Resolution:** *"Jab team mein design disagreement hota hai, main data aur POC (Proof of Concept) pe focus karta hoon bajaye argument ke."*
*   **Mentorship:** *"Main code reviews ko as a learning opportunity dekhta hoon, sirf bugs nikalne ke liye nahi."*
*   **Ownership:** *"AL-Habib project mein jab reconciliation fail ho raha tha, main ne end-to-end trace kiya aur logic fix kiya, jis se manual effort 80% kam ho gaya."*

---

## 📅 2-Day Final Sprint

### **Day 1: The Core & Framework**
*   **9 AM - 12 PM:** Java Core (Memory, GC, Multithreading, Streams).
*   **1 PM - 4 PM:** Spring Boot (Lifecycle, Scopes, Transaction, Security).
*   **5 PM - 8 PM:** JPA & Hibernate (N+1, Caching, Locking).
*   **Night:** SQL Joins, Indexes, Execution Plans.

### **Day 2: Architecture & Scenarios**
*   **9 AM - 12 PM:** Microservices (Saga, Circuit Breaker, Gateway, Kafka).
*   **1 PM - 4 PM:** Scenario-based practice (CPU 100%, DB Deadlocks, OutOfMemory).
*   **5 PM - 8 PM:** Resume Review (AL-Habib project details, LendLedger architecture).
*   **Night:** Mock Interview (Mirror ke samne self-intro aur project explanation).

---

## ⚡ 10 Senior Rapid Fire Questions
1.  **Difference between \`@Bean\` and \`@Component\`?** (\`@Bean\` for 3rd party classes, \`@Component\` for your classes).
2.  **What is a Deadlock and how to avoid it?** (Avoid circular dependencies, consistent locking order).
3.  **How to handle CORS in Spring Boot?** (\`@CrossOrigin\` or Global WebMvcConfigurer).
4.  **Difference between \`save()\` and \`saveAndFlush()\`?** (\`saveAndFlush\` fauran DB mein push karta hai).
5.  **What is the use of \`@Primary\`?** (Jab multiple beans hon same type ki, to default kaunsi uthani hai).
6.  **How to secure sensitive data in properties file?** (Use Jasypt or AWS Secrets Manager).
7.  **What is the difference between \`PUT\` and \`PATCH\`?** (Full vs Partial update).
8.  **How to implement Caching in Spring Boot?** (\`@EnableCaching\` + \`@Cacheable\`).
9.  **What is a JWT and what are its parts?** (Header, Payload, Signature).
10. **How to handle large file uploads in Spring?** (MultipartFile + Streaming).

---

**Rahool, tumhara experience Core Banking mein hai, jo ke sabse mushkil domain mana jata hai. Interviewer ko bas ye dikhao ke tumne sirf code nahi likha, tumne system ko "samjha" hai. Best of Luck! 🚀🔥**
`;
