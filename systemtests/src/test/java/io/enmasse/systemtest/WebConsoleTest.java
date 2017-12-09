package io.enmasse.systemtest;


import com.google.common.collect.Ordering;
import io.enmasse.systemtest.web.FilterType;
import io.enmasse.systemtest.web.SortType;

import java.util.ArrayList;
import java.util.stream.IntStream;

import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.*;

public abstract class WebConsoleTest extends SeleniumTestBase {

    public void doTestCreateDeleteAddress(Destination destination) throws Exception {
        createAddressWebConsole(destination);
        deleteAddressWebConsole(destination);
    }

    public void doTestFilterAddressesByType() throws Exception {
        int addressCount = 4;
        ArrayList<Destination> addresses = generateQueueTopicList("via-web", IntStream.range(0, addressCount));

        createAddressesWebConsole(addresses.toArray(new Destination[0]));
        assertThat(getAddressItems().size(), is(addressCount));
        addFilter(FilterType.TYPE, "queue");
        assertThat(getAddressItems().size(), is(addressCount / 2));

        removeFilterByType("queue");
        assertThat(getAddressItems().size(), is(addressCount));

        addFilter(FilterType.TYPE, "topic");
        assertThat(getAddressItems().size(), is(addressCount / 2));

        removeFilterByType("topic");
        assertThat(getAddressItems().size(), is(addressCount));
    }

    public void doTestFilterAddressesByName() throws Exception {
        int addressCount = 4;
        ArrayList<Destination> addresses = generateQueueTopicList("via-web", IntStream.range(0, addressCount));
        createAddressesWebConsole(addresses.toArray(new Destination[0]));

        addFilter(FilterType.NAME, "web");
        assertEquals(addressCount, getAddressItems().size());

        addFilter(FilterType.NAME, "via");
        assertEquals(addressCount, getAddressItems().size());

        removeFilterByName("web");
        assertEquals(addressCount, getAddressItems().size());

        addFilter(FilterType.NAME, "queue");
        assertEquals(addressCount / 2, getAddressItems().size());

        clearAllFilters();
        assertEquals(addressCount, getAddressItems().size());
    }

    public void doTestSortAddressesByName() throws Exception {
        int addressCount = 4;
        ArrayList<Destination> addresses = generateQueueTopicList("via-web", IntStream.range(0, addressCount));
        createAddressesWebConsole(addresses.toArray(new Destination[0]));

        sortItems(SortType.NAME, true);
        assertTrue(Ordering.natural().isOrdered(getAddressItems()));

        sortItems(SortType.NAME, false);
        assertTrue(Ordering.natural().reverse().isOrdered(getAddressItems()));
    }
}
