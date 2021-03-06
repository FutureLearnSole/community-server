import streamifyArray from 'streamify-array';
import { AclManager } from '../authorization/AclManager';
import { ExpressHttpServer } from '../server/ExpressHttpServer';
import { ResourceStore } from '../storage/ResourceStore';
import { TEXT_TURTLE } from '../util/ContentTypes';
import { RuntimeConfig, RuntimeConfigData } from './RuntimeConfig';

/**
 * Invokes all logic to setup a server.
 */
export class Setup {
  private readonly httpServer: ExpressHttpServer;
  private readonly store: ResourceStore;
  private readonly aclManager: AclManager;
  private readonly runtimeConfig: RuntimeConfig;

  public constructor(
    httpServer: ExpressHttpServer,
    store: ResourceStore,
    aclManager: AclManager,
    runtimeConfig: RuntimeConfig,
  ) {
    this.httpServer = httpServer;
    this.store = store;
    this.aclManager = aclManager;
    this.runtimeConfig = runtimeConfig;
  }

  /**
   * Set up a server at the given port and base URL.
   * @param data - Runtime config data.
   */
  public async setup(data: RuntimeConfigData = {}): Promise<RuntimeConfig> {
    this.runtimeConfig.reset(data);

    // Set up acl so everything can still be done by default
    // Note that this will need to be adapted to go through all the correct channels later on
    const aclSetup = async(): Promise<void> => {
      const acl = `@prefix   acl:  <http://www.w3.org/ns/auth/acl#>.
@prefix  foaf:  <http://xmlns.com/foaf/0.1/>.

<#authorization>
    a               acl:Authorization;
    acl:agentClass  foaf:Agent;
    acl:mode        acl:Read;
    acl:mode        acl:Write;
    acl:mode        acl:Append;
    acl:mode        acl:Delete;
    acl:mode        acl:Control;
    acl:accessTo    <${this.runtimeConfig.base}>;
    acl:default     <${this.runtimeConfig.base}>.`;
      await this.store.setRepresentation(
        await this.aclManager.getAcl({ path: this.runtimeConfig.base }),
        {
          binary: true,
          data: streamifyArray([ acl ]),
          metadata: {
            raw: [],
            profiles: [],
            contentType: TEXT_TURTLE,
          },
        },
      );
    };
    await aclSetup();

    this.httpServer.listen(this.runtimeConfig.port);

    return this.runtimeConfig;
  }
}
