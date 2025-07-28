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

    long search(long k) {
        if (root == null) {
            System.out.println("Tree is empty.");
            return -1;
        }
        return root.search(k);
    }

    BTree insert(Student s) {
        long k = s.studentId, rid = s.recordId;
        if (root == null) {
            root = new BTreeNode(t, true);
            root.keys[0] = k; root.values[0] = rid; root.n = 1;
            return this;
        }
        if (root.n == 2 * t - 1) {                 // root full → split
            BTreeNode r = new BTreeNode(t, false);
            r.children[0] = root;
            splitChild(r, 0, root);
            root = r;
        }
        insertNonFull(root, k, rid);
        return this;
    }
    
    private void splitChild(BTreeNode p, int idx, BTreeNode y) {
        BTreeNode z = new BTreeNode(t, y.leaf);

        /* move last t-1 keys (and children/values) from y → z */
        for (int j = 0; j < t - 1; j++)
            z.keys[j] = y.keys[j + t];
        if (y.leaf) {
            for (int j = 0; j < t - 1; j++)
                z.values[j] = y.values[j + t];
            z.next = y.next; y.next = z;
        } else {
            for (int j = 0; j < t; j++)
                z.children[j] = y.children[j + t];
        }
        z.n = t - 1; y.n = t - 1;

        /* parent p gets new child and separator key */
        for (int j = p.n; j > idx; j--) {
            p.children[j + 1] = p.children[j];
            p.keys[j] = p.keys[j - 1];
        }
        p.children[idx + 1] = z;
        p.keys[idx] = y.keys[t - 1];
        p.n++;
    }

    private void insertNonFull(BTreeNode x, long k, long rid) {
        int i = x.n - 1;
        if (x.leaf) {
            while (i >= 0 && k < x.keys[i]) {
                x.keys[i + 1] = x.keys[i];
                x.values[i + 1] = x.values[i];
                i--;
            }
            x.keys[i + 1] = k; x.values[i + 1] = rid; x.n++;
            return;
        }
        while (i >= 0 && k < x.keys[i]) i--;
        i++;
        if (x.children[i].n == 2 * t - 1) {
            splitChild(x, i, x.children[i]);
            if (k > x.keys[i]) i++;
        }
        insertNonFull(x.children[i], k, rid);
    }

    boolean delete(long k) {
        if (root == null) return false;
        boolean removed = deleteInternal(root, k);

        if (root.n == 0 && !root.leaf)          // shrink height
            root = root.children[0];
        if (root != null && root.n == 0) root = null;
        return removed;
    }

    /* recursive delete that guarantees child has ≥ t keys before descent */
    private boolean deleteInternal(BTreeNode x, long k) {

        int idx = findKey(x, k);

        /* ---------- CASE 1: key present in this node ---------- */
        if (idx < x.n && x.keys[idx] == k) {
            if (x.leaf) {                    // 1a: leaf => remove directly
                for (int i = idx; i < x.n - 1; i++) {
                    x.keys[i] = x.keys[i + 1];
                    x.values[i] = x.values[i + 1];
                }
                x.n--;
                return true;
            }
            /* 1b: internal node */
            return deleteFromInternal(x, idx);
        }

        /* ---------- CASE 2: key only in subtree ---------------- */
        if (x.leaf) return false;            // not found

        /* ensure child[idx] has ≥ t keys before recursing */
        boolean flag = (idx == x.n);         // was last child?
        if (x.children[idx].n < t)
            fill(x, idx);
        int nextIdx = flag && idx > x.n ? idx - 1 : idx;
        return deleteInternal(x.children[nextIdx], k);
    }

    /* remove key that is definitely in internal node x at index idx */
    private boolean deleteFromInternal(BTreeNode x, int idx) {

        long key = x.keys[idx];                 // ← capture the key once

        BTreeNode predChild = x.children[idx];
        BTreeNode succChild = x.children[idx + 1];

        if (predChild.n >= t) {                 // borrow predecessor
            long predKey = getPredecessor(predChild);
            long predVal = getPredVal(predChild);
            x.keys[idx] = predKey;
            return deleteInternal(predChild, predKey);
        }
        else if (succChild.n >= t) {            // borrow successor
            long succKey = getSuccessor(succChild);
            long succVal = succChild.values[0];
            x.keys[idx] = succKey;
            return deleteInternal(succChild, succKey);
        }
        else {                                  // merge the two children
            merge(x, idx);
            return deleteInternal(predChild, key);
    }
}

    // Helper methods
    private int findKey(BTreeNode x, long k) {
        int idx = 0;
        while (idx < x.n && x.keys[idx] < k) idx++;
        return idx;
    }

    private long getPredecessor(BTreeNode x) {
        while (!x.leaf) x = x.children[x.n];
        return x.keys[x.n - 1];
    }
    private long getPredVal(BTreeNode x) {
        while (!x.leaf) x = x.children[x.n];
        return x.values[x.n - 1];
    }

    private long getSuccessor(BTreeNode x) {
        while (!x.leaf) x = x.children[0];
        return x.keys[0];
    }

    /* make sure child[idx] has ≥ t keys */
    private void fill(BTreeNode x, int idx) {
        if (idx > 0 && x.children[idx - 1].n >= t)
            borrowFromPrev(x, idx);
        else if (idx < x.n && x.children[idx + 1].n >= t)
            borrowFromNext(x, idx);
        else
            merge(x, idx < x.n ? idx : idx - 1);
    }

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
        }
        /* move sep key from x down to child */
        child.keys[0] = x.keys[idx - 1];
        if (!child.leaf)
            child.children[0] = sib.children[sib.n];

        /* move sib's last key up to parent */
        x.keys[idx - 1] = sib.keys[sib.n - 1];

        child.n++;
        sib.n--;
    }

    private void borrowFromNext(BTreeNode x, int idx) {
        BTreeNode child = x.children[idx];
        BTreeNode sib   = x.children[idx + 1];

        /* bring sep key down to child */
        child.keys[child.n] = x.keys[idx];
        if (!child.leaf)
            child.children[child.n + 1] = sib.children[0];
        if (child.leaf)
            child.values[child.n] = sib.values[0];

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
    }

    private void merge(BTreeNode x, int idx) {
        BTreeNode child = x.children[idx];
        BTreeNode sib   = x.children[idx + 1];

        /* pull separator key from parent into child */
        child.keys[t - 1] = x.keys[idx];

        /* copy keys & children from sib → child */
        for (int i = 0; i < sib.n; i++)
            child.keys[i + t] = sib.keys[i];
        if (!child.leaf) {
            for (int i = 0; i <= sib.n; i++)
                child.children[i + t] = sib.children[i];
        } else {
            for (int i = 0; i < sib.n; i++)
                child.values[i + t] = sib.values[i];
            child.next = sib.next;          // link leaf list
        }
        child.n += sib.n + 1;

        /* remove sib and key from parent */
        for (int i = idx + 1; i < x.n; i++) {
            x.keys[i - 1] = x.keys[i];
            x.children[i] = x.children[i + 1];
        }
        x.n--;
    }

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
}
