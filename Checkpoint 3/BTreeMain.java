import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.Scanner;

/**
 * Main Application — *original skeleton preserved;
 * added helpers are wrapped in  // --- ADD ---  blocks.*
 */
public class BTreeMain {
    public static final String STUDENT_CSV = "src/Student.csv";
    public static final String INPUT_TXT = "src/input.txt";

    public static void main(String[] args) {

        /* Read the input file -- input.txt */
        Scanner scan = null;
        try {
            scan = new Scanner(new File(INPUT_TXT));
        } catch (FileNotFoundException e) {
            System.out.println("File not found.");
            return;
        }

        /* Read the minimum degree of B+Tree first */
        int degree = scan.nextInt();
        BTree bTree = new BTree(degree);

        /* ----------------- ADD:  load existing students ------------- */
        for (Student s : getStudents()) bTree.insert(s);
        /* ------------------------------------------------------------ */

        /* Start reading the operations now from input file*/
        try {
            while (scan.hasNextLine()) {
                Scanner s2 = new Scanner(scan.nextLine());

                while (s2.hasNext()) {

                    String operation = s2.next();

                    switch (operation) {
                        case "insert": {

                            long studentId   = Long.parseLong(s2.next());
                            String studentName = s2.next() + " " + s2.next();
                            String major     = s2.next();
                            String level     = s2.next();
                            int    age       = Integer.parseInt(s2.next());

                            /* ------------ ADD: generate or read RecordID ---- */
                            long recordID;
                            if (s2.hasNextLong()) {
                                recordID = s2.nextLong();
                            } else {
                                recordID = randomPositive();
                            }
                            /* ------------------------------------------------ */

                            Student s = new Student(studentId, age,
                                                    studentName, major,
                                                    level, recordID);
                            bTree.insert(s);

                            /* ------------ ADD: persist to CSV --------------- */
                            appendRow(s, STUDENT_CSV);
                            /* ------------------------------------------------ */
                            System.out.printf("Student inserted successfully (Id: %d).%n", s.studentId);
                            break;
                        }

                        case "delete": {
                            long studentId = Long.parseLong(s2.next());
                            boolean result = bTree.delete(studentId);
                            if (result) {
                                System.out.printf("Student deleted successfully (Id: %d).%n", studentId);
                                /* ---- ADD: reflect deletion in CSV ---------- */
                                removeRow(studentId, STUDENT_CSV);
                                /* ------------------------------------------- */
                            } else
                                System.out.printf("Student deletion failed (Id: %d).%n", studentId);
                            break;
                        }

                        case "search": {
                            long studentId = Long.parseLong(s2.next());
                            long recordID  = bTree.search(studentId);
                            if (recordID != -1)
                                System.out.println(
                                   "Student exists in the database at " + recordID);
                            else
                                System.out.printf("Student does not exist (Id: %d).%n", studentId);
                            break;
                        }

                        case "print": {
                            System.out.println("List of recordIDs in B+Tree "
                                               + bTree.print());
                            break;
                        }

                        default:
                            System.out.println("Wrong Operation");
                    }
                }
                s2.close();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        scan.close();
    }

    /** Load all rows from Student.csv (no header expected). */
    private static List<Student> getStudents() {
        List<Student> list = new ArrayList<>();
        try (Scanner s = new Scanner(new File(STUDENT_CSV))) {
            while (s.hasNextLine()) {
                String[] p = s.nextLine().split("\\s*,\\s*");
                if (p.length != 6) continue;           // skip malformed
                list.add(new Student(Long.parseLong(p[0]),
                                     Integer.parseInt(p[4]),
                                     p[1], p[2], p[3],
                                     Long.parseLong(p[5])));
            }
            s.close();
        } catch (FileNotFoundException ignore) { }     // empty DB is OK
        return list;
    }

    /** Append one student row to Student.csv. */
    private static void appendRow(Student st, String csv) {
        try (FileWriter fw = new FileWriter(csv, true);
             PrintWriter pw = new PrintWriter(fw)) {
            pw.printf("%d,%s,%s,%s,%d,%d%n",
                      st.studentId, st.studentName, st.major,
                      st.level, st.age, st.recordId);
        } catch (Exception e) {
            System.out.println("CSV append failed: " + e.getMessage());
        }
    }

    /** Rewrite CSV without the row whose StudentID matches id. */
    private static void removeRow(long id, String csv) {
        List<String> keep = new ArrayList<>();
        try (Scanner sc = new Scanner(new File(csv))) {
            while (sc.hasNextLine()) {
                String row = sc.nextLine();
                if (!row.startsWith(id + ",")) keep.add(row);
            }
            sc.close();
        } catch (FileNotFoundException ignore) { return; }

        try (PrintWriter pw = new PrintWriter(csv)) {
            for (String r : keep) pw.println(r);
        } catch (Exception e) {
            System.out.println("CSV rewrite failed: " + e.getMessage());
        }
    }

    /** Positive random long — used when RecordID not provided. */
    private static long randomPositive() {
        long r; do { r = new Random().nextLong(); } while (r <= 0); return r;
    }

    /* Debugging function to Print the entire B+Tree structure. */
    private static void printTree(BTree bTree) {
        if (bTree == null) {
            System.out.println("Tree is empty.");
            return;
        }
        
        BTreeNode root = bTree.getRoot();
        if (root == null) {
            System.out.println("Tree is empty.");
            return;
        }
        
        System.out.println("B+Tree Structure:");
        printTreeHelper(root, 0);
    }
    
    // Recursive helper to print all nodes
    private static void printTreeHelper(BTreeNode node, int level) {
        if (node == null) return;
        
        // Print indentation for tree structure visualization
        String indent = "  ".repeat(level);
        
        System.out.printf("%sLevel %d %s: ", indent, level, node.leaf ? "(Leaf)" : "(Internal)");
        
        // Print all keys in this node
        System.out.print("Keys[");
        for (int i = 0; i < node.n; i++) {
            System.out.print(node.keys[i]);
            if (i < node.n - 1) System.out.print(", ");
        }
        System.out.print("]");
        
        // If it's a leaf node, also print the values (recordIDs)
        if (node.leaf) {
            System.out.print(" Values[");
            for (int i = 0; i < node.n; i++) {
                System.out.print(node.values[i]);
                if (i < node.n - 1) System.out.print(", ");
            }
            System.out.print("]");
        }
        
        System.out.println(); // New line after each node
        
        // Recursively print children (if internal node)
        if (!node.leaf) {
            for (int i = 0; i <= node.n; i++) {
                if (node.children[i] != null) {
                    printTreeHelper(node.children[i], level + 1);
                }
            }
        }
    }
}
