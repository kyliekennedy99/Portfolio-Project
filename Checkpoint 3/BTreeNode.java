class BTreeNode {

    /**
     * Array of the keys stored in the node.
     */
    long[] keys;
    /**
     * Array of the values[recordID] stored in the node. This will only be filled when the node is a leaf node.
     */
    long[] values;
    /**
     * Minimum degree (defines the range for number of keys)
     **/
    int t;
    /**
     * Pointers to the children, if this node is not a leaf.  If
     * this node is a leaf, then null.
     */
    BTreeNode[] children;
    /**
     * number of key-value pairs in the B-tree
     */
    int n;
    /**
     * true when node is leaf. Otherwise false
     */
    boolean leaf;

    /**
     * point to other next node when it is a leaf node. Otherwise null
     */
    BTreeNode next;

    // Constructor
    BTreeNode(int t, boolean leaf) {
        this.t        = t;
        this.leaf     = leaf;
        this.keys     = new long[2 * t];
        this.values   = new long[2 * t];
        this.children = new BTreeNode[2 * t + 1];
        this.n        = 0;
        this.next     = null;
    }

    // Helper search
    long search(long k) {
        int i = 0;
        while (i < n && k > keys[i]) i++;

        if (leaf) {
            return (i < n && keys[i] == k) ? values[i] : -1;
        }
        return (children[i] != null) ? children[i].search(k) : -1;
    }
}
