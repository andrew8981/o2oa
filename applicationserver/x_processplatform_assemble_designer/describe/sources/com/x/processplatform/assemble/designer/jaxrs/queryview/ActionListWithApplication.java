package com.x.processplatform.assemble.designer.jaxrs.queryview;

import java.util.List;

import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.entity.JpaObject;
import com.x.base.core.project.annotation.FieldDescribe;
import com.x.base.core.project.bean.WrapCopier;
import com.x.base.core.project.bean.WrapCopierFactory;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.processplatform.assemble.designer.Business;
import com.x.processplatform.core.entity.element.Application;
import com.x.processplatform.core.entity.element.QueryView;

class ActionListWithApplication extends BaseAction {
	ActionResult<List<Wo>> execute(EffectivePerson effectivePerson, String applicationId) throws Exception {
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			ActionResult<List<Wo>> result = new ActionResult<>();
			Business business = new Business(emc);
			Application application = emc.find(applicationId, Application.class);
			if (null == application) {
				throw new ExceptionApplicationNotExist(applicationId);
			}
			if (!business.editable(effectivePerson, application)) {
				throw new ExceptionApplicationAccessDenied(effectivePerson.getDistinguishedName(),
						application.getName(), application.getId());
			}
			List<String> ids = business.queryView().listWithApplication(applicationId);
			List<QueryView> os = emc.list(QueryView.class, ids);
			List<Wo> wos = Wo.copier.copy(os);
			wos = business.queryView().sort(wos);
			result.setData(wos);
			return result;
		}
	}

	public static class Wo extends QueryView {

		private static final long serialVersionUID = 2886873983211744188L;

		static WrapCopier<QueryView, Wo> copier = WrapCopierFactory.wo(QueryView.class, Wo.class, null,
				JpaObject.FieldsInvisible);

		@FieldDescribe("排序号")
		private Long rank;

		public Long getRank() {
			return rank;
		}

		public void setRank(Long rank) {
			this.rank = rank;
		}

	}
}
