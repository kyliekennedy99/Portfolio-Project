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
    private final int t;                // minimum degree

    BTree(int t) {
        this.root = null;
        this.t = t;
    }

    /**
     * Search in the B+Tree.
     * Return recordID for the given StudentID.
     * Otherwise, print out a message that the given studentId has not been found in the table and return -1.
     */
    long search(long k) {
        if (root == null) {
            System.out.println("Tree is empty.");
            return -1;
        }
        return root.search(k); // call the search method of the root node that returns the recordID
    }

    /**
     * Insert in the B+Tree.
     */
    BTree insert(Student s) {
        long k = s.studentId, rid = s.recordId;
        if (root == null) {
            root = new BTreeNode(t, true);
            root.keys[0] = k; root.values[0] = rid; root.n = 1;
            return this;
        }
        if (root.n == 2 * t) {                 // root full → split
            BTreeNode r = new BTreeNode(t, false);
            r.children[0] = root;
            splitChild(r, 0, root);
            root = r;
        }
        insertNonFull(root, k, rid);
        //System.out.println("List of recordIDs in B+Tree " + this.print()); // print all the records
        return this;
    }
    
    // Split a child node into two nodes and update it's parent to include the new node
    private void splitChild(BTreeNode p, int idx, BTreeNode y) {
        BTreeNode z = new BTreeNode(t, y.leaf); //The new node being created

        /* move last t-1 keys (and children/values) from y → z */
        for (int j = 0; j < t; j++) {
            z.keys[j] = y.keys[j + t];
            z.n++; y.n--; // update sizes
        }
        if (y.leaf) { // if leaf move values
            for (int j = 0; j < t; j++)
                z.values[j] = y.values[j + t];
            z.next = y.next; y.next = z;
        } else { // if not leaf move children
            for (int j = 0; j < t+1; j++) 
                z.children[j] = y.children[j + t];
            y.n--; // if not leaf node, size needs to be one less
        }

        /* parent p gets new child and separator key */
        for (int j = p.n; j > idx; j--) {
            p.children[j + 1] = p.children[j];
            p.keys[j] = p.keys[j - 1];
        }
        p.children[idx + 1] = z;
        p.keys[idx] = y.keys[t - 1];
        p.n++;
    }

    // Insert a key into a tree that doesn't have a full root node
    private void insertNonFull(BTreeNode x, long k, long rid) {
        int i = x.n - 1;
        if (x.leaf) { // Base case: leaf node with space, insert the key directly
            while (i >= 0 && k < x.keys[i]) {
                x.keys[i + 1] = x.keys[i];
                x.values[i + 1] = x.values[i];
                i--;
            }
            x.keys[i + 1] = k; x.values[i + 1] = rid; x.n++;
            return;
        }
        while (i >= 0 && k < x.keys[i]) i--; // Find the Btree index for the key we are inserting
        i++;
        if (x.children[i].n == 2 * t) { // If the child we are going to insert into is full, we need to split it first
            splitChild(x, i, x.children[i]);
            if (k > x.keys[i]) i++;
        }
        insertNonFull(x.children[i], k, rid); // Recursive call to insert the key into the appropriate child node
    }

    /**
     * Delete in the B+Tree.
     * Return true if the student is deleted successfully otherwise, return false.
     */
    boolean delete(long k) {
        if (root == null) return false; // nothing to delete if root is null
        //boolean removed = deleteInternal(root, k); // call the recursive delete method
        boolean removed = deleteInternal(null, root, k, new BTreeNode[1]); // call the recursive delete method

        if (root.n == 0 && !root.leaf) // if we need to shrink height
            root = root.children[0];
        if (root != null && root.n == 0) root = null; // if tree is empty after deletion, set root to null
        //System.out.println("List of recordIDs in B+Tree " + this.print()); // print all the records
        return removed;
    }

    /*    Delete take 2 */
    private boolean deleteInternal(BTreeNode parent, BTreeNode node,long key, BTreeNode[] oldChild) {
        int idx = findKey(node, key); // Find the index in the BTree Node for the key k
        if(node.leaf) {
            // If leaf node, remove key directly
            if (idx < node.n && node.keys[idx] == key) {
                for (int i = idx; i < node.n - 1; i++) {
                    node.keys[i] = node.keys[i + 1];
                    node.values[i] = node.values[i + 1];
                }
                node.n--;
                if (parent != null) {
                    int idxParent = findKey(parent, key);
                    if (node.n < t && parent != null) { // if underflows and not root node, re-balance
                        if (idxParent > 0 && parent.children[idxParent - 1].n > t) {
                            borrowFromPrev(parent, idxParent);
                            oldChild[0] = null;
                        } else if (idxParent < parent.n && parent.children[idxParent + 1].n > t) {
                            borrowFromNext(parent, idxParent);
                            oldChild[0] = null;
                        } else {
                            int indexToMerge = (idxParent < parent.n ? idxParent : idxParent - 1);
                            merge(parent, indexToMerge);
                            oldChild[0] = parent.children[indexToMerge + 1]; //node to delete
                        }
                    }
                    //if (idxParent < parent.n) {
                    //   parent.keys[idxParent] = node.keys[node.n - 1]; //move new last key up to parent
                    //}
                }
                return true;
            } else { return false; } // If key not found in leaf, we can just return false
        } else { // If not leaf, continue down the tree
            boolean deleted  = deleteInternal(node, node.children[idx], key, oldChild);
            if (parent != null) {
                int idxParent = findKey(parent, key);
                if (oldChild[0] != null && node.n < t) {
                    if (idxParent > 0 && parent.children[idxParent - 1].n > t) {
                        borrowFromPrev(parent, idxParent);
                        oldChild[0] = null;
                    } else if (idxParent < parent.n && parent.children[idxParent + 1].n > t) {
                        borrowFromNext(parent, idxParent);
                        oldChild[0] = null;
                    } else {
                        int indexToMerge = (idxParent < parent.n ? idxParent : idxParent - 1);
                        merge(parent, indexToMerge);
                        oldChild[0] = parent.children[indexToMerge + 1]; //node to delete
                    }
                }
                //if (idxParent < parent.n) {
                //    parent.keys[idxParent] = node.keys[node.n - 1]; //move new last key up to parent
                //}
            }
            return deleted;
        }
    }

    // Helper methods
    // Find the index of the first key greater than or equal to key k
    private int findKey(BTreeNode x, long k) {
        int idx = 0;
        while (idx < x.n && x.keys[idx] < k) idx++;
        return idx;
    }

    // Move an entry from the previous sibling to the current node
    private void borrowFromPrev(BTreeNode x, int idx) {
        BTreeNode child = x.children[idx];
        BTreeNode sib   = x.children[idx - 1];

        /* shift child right */
        for (int i = child.n - 1; i >= 0; i--) {
            child.keys[i + 1] = child.keys[i];
            if (child.leaf) child.values[i + 1] = child.values[i];
        }
        if (!child.leaf) {
            for (int i = child.n; i >= 0; i--)
                child.children[i + 1] = child.children[i];
            child.keys[0] = x.keys[idx-1]; //move seperator key down to sib
            child.children[0] = sib.children[sib.n];
            x.keys[idx-1] = sib.keys[sib.n - 1];
        } else {
            child.keys[0] = sib.keys[sib.n - 1];
            child.values[0] = sib.values[sib.n - 1];
            x.keys[idx-1] = sib.keys[sib.n - 2];
        }

        child.n++;
        sib.n--;
    }

    // Move an entry from the next sibling to the current node
    private void borrowFromNext(BTreeNode x, int idx) {
        BTreeNode child = x.children[idx];
        BTreeNode sib   = x.children[idx + 1];

        /* bring sep key down to child */
        if (!child.leaf) {
            child.keys[child.n] = x.keys[idx];
            child.children[child.n + 1] = sib.children[0];
        } else {
            child.keys[child.n] = sib.keys[0];
            child.values[child.n] = sib.values[0];
        }

        /* move sib's first key up to parent */
        x.keys[idx] = sib.keys[0];

        /* shift sib left */
        for (int i = 1; i < sib.n; i++) {
            sib.keys[i - 1] = sib.keys[i];
            if (sib.leaf) sib.values[i - 1] = sib.values[i];
        }
        if (!sib.leaf) {
            for (int i = 1; i <= sib.n; i++)
                sib.children[i - 1] = sib.children[i];
        }

        child.n++;
        sib.n--;

        /* move new last key up to parent */
        //x.keys[idx] = child.keys[child.n - 1];
        //if (x.n < idx) 
        //    x.keys[idx + 1] = sib.keys[sib.n - 1];
    }

    // Merges the child at index idx of the current node with its right sibling and updates the parent
    private void merge(BTreeNode x, int idx) {
        BTreeNode child = x.children[idx];
        BTreeNode sib   = x.children[idx + 1];

        /* pull separator key from parent into child */
        //child.keys[t - 1] = x.keys[idx]; This does nothing, overwites a value with the same value

        /* copy keys & children from sib → child */
        if (!child.leaf) {
            child.keys[child.n] = x.keys[idx]; // move the separator key down to the child
            child.n++;
            for (int i = 0; i < sib.n; i++)
                child.keys[i + child.n] = sib.keys[i];
            for (int i = 0; i <= sib.n; i++) // copy children from sib to child
                child.children[i + child.n] = sib.children[i];
        }
        else {
            for (int i = 0; i < sib.n; i++)
                child.keys[i + child.n] = sib.keys[i];
            for (int i = 0; i < sib.n; i++)
                child.values[i + child.n] = sib.values[i];
            child.next = sib.next;          // link leaf list
        }
        child.n += sib.n;

        /* remove sib and key from parent */
        for (int i = idx + 1; i < x.n; i++) {
            x.keys[i - 1] = x.keys[i];
            x.children[i] = x.children[i + 1];
        }
        x.n--;

        
        if (x.n < idx) 
            x.keys[idx] = child.keys[child.n - 1]; // Update parent key to be child final key
    }

    /**
     * Print the B+Tree.
     * Return a list of recordIDs from left to right of leaf nodes.
     */
    List<Long> print() {
        List<Long> ids = new ArrayList<>();
        if (root == null) return ids;
        BTreeNode cur = root;
        while (!cur.leaf) cur = cur.children[0];
        while (cur != null) {
            for (int i = 0; i < cur.n; i++) ids.add(cur.values[i]);
            cur = cur.next;
        }
        return ids;
    }
    
    /**
     * Get the root node for external access (for printing tree structure).
     */
    BTreeNode getRoot() {
        return root;
    }
}
