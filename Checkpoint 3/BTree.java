import java.util.ArrayList;
import java.util.List;

/**
 * B+Tree Structure
 * Key - StudentId
 * Leaf Node should contain [ key,recordId ]
 */
class BTree {

    /**
     * Pointer to the root node.
     */
    private BTreeNode root;
    /**
     * Number of key-value pairs allowed in the tree/the minimum degree of B+Tree
     **/
    private int t;

    BTree(int t) {
        this.root = null;
        this.t = t;
    }

    long search(long studentId) {
        /**
         * TODO:
         * Implement this function to search in the B+Tree.
         * Return recordID for the given StudentID.
         * Otherwise, print out a message that the given studentId has not been found in the table and return -1.
         */
        return -1;
    }

    BTree insert(Student student) {
        /**
         * TODO:
         * Implement this function to insert in the B+Tree.
         * Also, insert in student.csv after inserting in B+Tree.
         */
        return this;
    }

    boolean delete(long studentId) {
        /**
         * TODO:
         * Implement this function to delete in the B+Tree.
         * Also, delete in student.csv after deleting in B+Tree, if it exists.
         * Return true if the student is deleted successfully otherwise, return false.
         */
        delete_recursiveHelper(null, root, studentId, null);
        
        return true;
    }
    boolean delete_recursiveHelper(BTreeNode parent, BTreeNode node, Long studentId, Long oldEntry) {
        if(node.leaf == false) { //non-leaf node
            //choose the subtree to continue searching
            int i = 0;
            while (i < node.n && studentId > node.keys[i]) {
                i++;
            }
            delete_recursiveHelper(node, node.children[i], studentId, null); //recursive call to go down the tree
            if(oldEntry == null) { return false; } //if oldEntry is null, it means we didn't find the studentId in the tree
            else {
                //remove node
            }
        } else { //leaf node
            //TODO: need to account for merging from the left sibling
            if(node.n > node.t) { //if node has entries to spare aka if it has more than t
                for (int i = 0; i < node.n; i++) {
                    if(node.keys[i] == studentId) {
                        // Found the key, delete it
                        for (int j = i; j < node.n - 1; j++) {
                            node.keys[j] = node.keys[j + 1];
                        }
                        node.keys[node.n] = 0L; // Clear the last key
                        node.n--; // decrement the count of keys
                        oldEntry = null;
                        return true;
                    }
                }
            }
            else {
                if(node.next.n > node.t) { //if next node has entries to spare
                    redistributeSiblings(node, node.next, parent);//Redistribute from sibling
                    oldEntry = null; // Reset oldEntry since we are redistributing
                } else {
                    mergeSiblings(node, node.next, parent);
                }
                
            }
        }
        return false;
    }

    //Takes entries from right sibling and redistributes them to the current node
    void redistributeSiblings(BTreeNode node, BTreeNode sibling, BTreeNode parent) {
        if (node == null || sibling == null || parent == null) { return; }
        if (node.next != sibling) { return; } // Ensure that sibling is actually the next node

        long oldEntryKey = sibling.keys[0];
        while(node.n < sibling.n) { //loop until node has the same number of entries as sibling
            //add sibling values to node
            node.keys[node.n] = sibling.keys[0];
            node.values[node.n] = sibling.values[0];
            node.n++;
            //shift over sibling values
            for (int i = 0; i < sibling.n - 1; i++) {
                sibling.keys[i] = sibling.keys[i + 1];
                sibling.values[i] = sibling.values[i + 1];
            }
            //clear out the last entry in sibling
            sibling.keys[sibling.n - 1] = 0L;
            sibling.values[sibling.n - 1] = 0L;
            sibling.n--;
        }
        // fix up parent pointers
        for(int i = 0; i < parent.n; i++) {
            if(parent.keys[i] == oldEntryKey) {
                parent.keys[i] = sibling.keys[0];
                break;
            }
        }
    }

    //Merges the current node with its right sibling.
    void mergeSiblings(BTreeNode node, BTreeNode sibling, BTreeNode parent) {
        if (node == null || sibling == null || parent == null) { return; }

        // Merge the keys and values from the sibling into the current node
        for (int j = 0; j < sibling.n; j++) {
            node.keys[node.n] = sibling.keys[j];
            node.values[node.n] = sibling.values[j];
            node.n++;
        }
        node.next = sibling.next; // Update the current node to have the sibling's next node

        // Remove the sibling from the parent
        for (int i = 0; i < parent.n; i++) {
            if (parent.children[i] == node) { //Find the sibling in the parent
                for (int j = i; j < parent.n - 1; j++) {
                    parent.keys[j] = parent.keys[j + 1];
                    parent.children[j + 1] = parent.children[j + 2];
                }
                parent.n--;
                parent.keys[parent.n] = 0L; // Clear the last key
                parent.children[parent.n] = null; // Clear the last child pointer
                break;
            }
        }
        
    }

    List<Long> print() {

        List<Long> listOfRecordID = new ArrayList<>();

        /**
         * TODO:
         * Implement this function to print the B+Tree.
         * Return a list of recordIDs from left to right of leaf nodes.
         *
         */
        BTreeNode current = root;
        while (current != null) {
            if (current.leaf) {
                for (int i = 0; i < current.n; i++) {
                    listOfRecordID.add(current.values[i]);
                }
                break;
            } else {
                current = current.next; // Move to the next leaf node
            }
        }

        return listOfRecordID;
    }
}
