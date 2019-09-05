/*
 * Copyright 2019, EnMasse authors.
 * License: Apache License 2.0 (see the file LICENSE or http://apache.org/licenses/LICENSE-2.0.html).
 */
package io.enmasse.systemtest.iot.registry;

import static io.enmasse.systemtest.bases.DefaultDeviceRegistry.newInfinispanBased;

import java.nio.ByteBuffer;

import org.junit.jupiter.api.Test;

import io.enmasse.iot.model.v1.IoTConfig;
import io.enmasse.iot.model.v1.IoTConfigBuilder;
import io.enmasse.systemtest.CertBundle;
import io.enmasse.systemtest.SystemtestsKubernetesApps;
import io.enmasse.systemtest.utils.CertificateUtils;

public class InfinispanDeviceRegistryTest extends DeviceRegistryTestBase {

    @Override
    protected IoTConfig provideIoTConfig() throws Exception {
        CertBundle certBundle = CertificateUtils.createCertBundle();
        return new IoTConfigBuilder()
                .withNewMetadata()
                .withName("default")
                .endMetadata()
                .withNewSpec()
                .withNewServices()
                .withDeviceRegistry(newInfinispanBased())
                .endServices()
                .withNewAdapters()
                .withNewMqtt()
                .withNewEndpoint()
                .withNewKeyCertificateStrategy()
                .withCertificate(ByteBuffer.wrap(certBundle.getCert().getBytes()))
                .withKey(ByteBuffer.wrap(certBundle.getKey().getBytes()))
                .endKeyCertificateStrategy()
                .endEndpoint()
                .endMqtt()
                .endAdapters()
                .endSpec()
                .build();
    }

    @Override
    protected void removeIoTConfig() throws Exception {
        super.removeIoTConfig();
        SystemtestsKubernetesApps.deleteInfinispanServer(kubernetes.getInfraNamespace());
    }

    @Test
    public void testCorrectTypeDeployed () {
        assertCorrectRegistryType("infinispan");
    }

}
