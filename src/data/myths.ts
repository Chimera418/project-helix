export interface MythQuestion {
  id: string;
  category: "Cybersecurity" | "Artificial Intelligence" | "Programming" | "Internet & Networking" | "Hardware/Systems";
  difficulty: "easy" | "medium" | "hard";
  statements: [string, string, string];
  correctIndex: number; // The index of the FALSE statement (the myth)
  explanations: [string, string, string];
}

export const myths: MythQuestion[] = [
  {
    id: "m1",
    category: "Cybersecurity",
    difficulty: "hard",
    statements: [
      "Hashing is a two-way mathematical function used to encrypt passwords.",
      "A buffer overflow attack can overwrite a program's return address to execute arbitrary code.",
      "Salting a password mitigates the effectiveness of precomputed rainbow table attacks."
    ],
    correctIndex: 0,
    explanations: [
      "MYTH: Hashing is strictly a one-way mathematical function. It is not encryption, as it is designed to be computationally infeasible to reverse.",
      "FACT: By inputting more data than a buffer can hold, an attacker can overwrite adjacent memory, including stack return pointers.",
      "FACT: A unique salt ensures that two identical passwords yield different hashes, rendering bulk rainbow tables useless."
    ]
  },
  {
    id: "m2",
    category: "Hardware/Systems",
    difficulty: "hard",
    statements: [
      "Docker containers run purely isolated instances of a given operating system's kernel.",
      "A level 1 (L1) CPU cache is smaller but significantly faster than L2 cache.",
      "ECC (Error-Correcting Code) memory can detect and fix single-bit data flips caused by cosmic rays."
    ],
    correctIndex: 0,
    explanations: [
      "MYTH: Unlike Virtual Machines, containers share the host machine's OS kernel directly, rather than running their own isolated kernel.",
      "FACT: CPU cache hierarchy places the smallest, fastest memory (L1) closest to the processing cores.",
      "FACT: Cosmic rays can indeed flip bits in RAM. ECC memory uses parity bits and algorithms to detect and correct single-bit errors dynamically."
    ]
  },
  {
    id: "m3",
    category: "Artificial Intelligence",
    difficulty: "hard",
    statements: [
      "The 'temperature' parameter in language generation guarantees deterministic output when set to 1.0.",
      "Transformers replaced Recurrent Neural Networks (RNNs) as the dominant architecture for NLP due to superior parallelization.",
      "Gradient descent algorithms aim to find the global minimum of the loss function, but often settle in local minima."
    ],
    correctIndex: 0,
    explanations: [
      "MYTH: A temperature of 1.0 represents standard non-deterministic randomness. A temperature of 0.0 is used to force greedy, deterministic decoding.",
      "FACT: Unlike RNNs which process sequential data linearly, Transformers use self-attention mechanisms that can process entire sequences in parallel.",
      "FACT: The optimization topography of deep neural networks is highly non-convex, often trapping standard gradient descent in local minima rather than global ones."
    ]
  },
  {
    id: "m4",
    category: "Programming",
    difficulty: "hard",
    statements: [
      "In standard C++, dynamically allocating memory with `malloc` automatically triggers an object's constructor.",
      "Floating point arithmetic (IEEE 754) cannot accurately represent the base-10 calculation of 0.1 + 0.2.",
      "Tail-call optimization allows functional programming languages to execute deep recursive functions without blowing the stack."
    ],
    correctIndex: 0,
    explanations: [
      "MYTH: `malloc` is a legacy C function that simply allocates raw bytes of memory. Only the `new` keyword in C++ triggers an object's constructor.",
      "FACT: Base-2 binary fractions cannot perfectly represent certain base-10 decimals like 0.1, leading to standard precision errors (e.g., 0.30000000000000004).",
      "FACT: Tail-call optimization reuses the same stack frame for recursive calls, completely eliminating stack overflow errors."
    ]
  },
  {
    id: "m5",
    category: "Internet & Networking",
    difficulty: "hard",
    statements: [
      "TCP is explicitly connectionless and does not guarantee packet delivery.",
      "DNS uses port 53 and primarily operates over UDP for its queries.",
      "BGP (Border Gateway Protocol) is responsible for routing data across the core autonomous systems of the internet."
    ],
    correctIndex: 0,
    explanations: [
      "MYTH: TCP (Transmission Control Protocol) is connection-oriented and has strict handshake and acknowledgment protocols to guarantee delivery. UDP is the connectionless protocol.",
      "FACT: Standard DNS queries are lightweight and rely on the speed of connectionless UDP over Port 53.",
      "FACT: BGP is literally the protocol that makes the internet work by determining the best routes between autonomous massive networks."
    ]
  },
  {
    id: "m6",
    category: "Cybersecurity",
    difficulty: "hard",
    statements: [
      "The Diffie-Hellman protocol enables two parties to securely exchange encryption keys over a public, monitored channel.",
      "Cross-Site Request Forgery (CSRF) allows an attacker to inject and execute arbitrary JavaScript on a victim's browser.",
      "An SQL injection attack can be completely mitigated by strictly using parameterized queries."
    ],
    correctIndex: 1,
    explanations: [
      "FACT: Diffie-Hellman uses modular arithmetic to allow both parties to independently calculate the same shared secret without actually sending it over the network.",
      "MYTH: You are describing Cross-Site Scripting (XSS). CSRF tricks a victim into submitting an unwanted action using their pre-authenticated session.",
      "FACT: Parameterized queries separate the data from the SQL code structure, ensuring malicious inputs are treated strictly as literal values, not executable SQL."
    ]
  },
  {
    id: "m7",
    category: "Hardware/Systems",
    difficulty: "hard",
    statements: [
      "POSIX-compliant systems store file permissions and ownership metadata strictly inside the actual file content.",
      "A solid-state drive (SSD) uses TRIM commands to proactively erase invalid data blocks, maintaining write performance.",
      "Context switching between OS threads is computationally expensive because it requires saving and loading CPU register states."
    ],
    correctIndex: 0,
    explanations: [
      "MYTH: POSIX systems store file metadata (permissions, owner, timestamps) in an inode structure outside of the file's data payload.",
      "FACT: NAND flash cannot overwrite existing data. The TRIM command tells the drive which blocks are no longer used so they can be erased ahead of time.",
      "FACT: Context switches require the OS kernel to flush pipelines, store the current thread's state, and load the incoming thread's state into the registers."
    ]
  },
  {
    id: "m8",
    category: "Programming",
    difficulty: "hard",
    statements: [
      "In JavaScript, primitive types are always passed by reference.",
      "The 'Big O' notation for standard quicksort's worst-case time complexity is O(n²), not O(n log n).",
      "Git is fundamentally a distributed graph of cryptographic hashes representing snapshots of a filesystem."
    ],
    correctIndex: 0,
    explanations: [
      "MYTH: JavaScript primitives (numbers, strings, booleans) are passed by value. Only objects and arrays are passed by reference.",
      "FACT: While quicksort averages O(n log n), a poorly chosen pivot (like sorting an already sorted array using the first element) degrades to O(n²).",
      "FACT: Git does not track structural diffs internally. It stores full filesystem snapshots hashed into trees and commits on a directed acyclic graph."
    ]
  }
];
