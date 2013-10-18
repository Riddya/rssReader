<?php

namespace RSS\ReaderBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use RSS\ReaderBundle\Entity\Rss;
use RSS\ReaderBundle\Form\RssType;
use RSS\ReaderBundle\Entity\Tags;
use RSS\ReaderBundle\Form\TagsType;
use RSS\ReaderBundle\Controller\TagsController;

/**
 * Rss controller.
 *
 * @Route("/rss")
 */
class RssController extends Controller
{

    /**
     * Lists all Rss entities.
     *
     * @Route("/list", name="rss_list")
     * @Method("GET")
     * @Template()
     */
    public function indexAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();

        $entities = $em->getRepository('RSSReaderBundle:Rss')->findAll();
        arsort($entities);
        $entity = new Rss();
        $form = $this->createCreateForm($entity);
        $form->handleRequest($request);
        if ($form->isValid()) {
            $entity->setCreateDate(new \DateTime("now"));
            $entity->setUpdateDate(new \DateTime("now"));
            $em->persist($entity);
            $em->flush();

            return $this->redirect($this->generateUrl('rss_show', array('id' => $entity->getId())));
        }
        return array(
            'entities' => $entities,
            'entity' => $entity,
            'form'   => $form->createView()
        );
    }



    public function myErrorHandler($errno, $errstr, $errfile, $errline)
    {
        // error was suppressed with the @-operator
        if (0 === error_reporting()) {
            return false;
        }

        throw new \ErrorException($errstr, 0, $errno, $errfile, $errline);
    }

    /**
     * Creates a new Rss entity.
     *
     * @Route("/create", name="rss_create")
     * @Method("POST")
     * @Template("RSSReaderBundle:Rss:new.html.twig")
     */
    public function createAction(Request $request)
    {
        $entity = new Rss();
        $tags = array();
        $form = $this->createCreateForm($entity);
        $form->handleRequest($request);
        set_error_handler(array($this,"myErrorHandler"), E_ALL);
        if ($form->isValid()) {
            $url = $entity->getUrl();
            if (@fopen($url, "r")) {
                try {
                    $rss = simplexml_load_file($url);
                }
                catch (\ErrorException $e) {
                    throw $this->createNotFoundException('This RSS Feed is invalid');
                }
                $em = $this->getDoctrine()->getManager();
                $entity->setCreateDate(new \DateTime("now"));
                $entity->setUpdateDate(new \DateTime("now"));
                $em->persist($entity);
                foreach ($rss->xpath("//channel/item/category") as $category) {
                    $category = trim($category);
                    $temp = explode(',',$category);
                    foreach ($temp as $cat) {
                        $cat = trim($cat);
                        if (!in_array($cat,$tags)) {
                            $tag = new Tags();
                            $tag->setTag($cat);
                            $tag->setIdRss($entity);
                            $em->persist($tag);
                        }
                        array_push($tags,$cat);
                    }

                }
                $em->flush();

                return $this->redirect($this->generateUrl('rss_show', array('id' => $entity->getId())));
            } else {
                throw $this->createNotFoundException('This URL Address is invalid');
            }
        }

        return array(
            'entity' => $entity,
            'form'   => $form->createView(),
        );
    }


    /**
     * @Route("/drag", name="drag")
     * @Template()
     */
    public function dragAndDropAction() {
        $i = 0;
        $rss_list = array();
        $em = $this->getDoctrine()->getManager();
        $rssFeeds = $em->getRepository("RSSReaderBundle:Rss")->findAll();
        $tags = $em->getRepository("RSSReaderBundle:Tags")->findAll();
        foreach ($rssFeeds as $rss) {
            $rss_list[$i]['rssId'] = $rss->getId();
            $rss_list[$i]['name'] = $rss->getName();
            foreach ($tags as $tag) {
                if ($tag->getIdRss() == $rss){
                    $rss_list[$i]['tag'][] = $tag->getTag();
                }
            }
            $i++;
        }
        return array(
            'temp' => $rss_list,
            'tags' => $tags,
            'rssItems'  => $rssFeeds
        );
    }

    /**
    * Creates a form to create a Rss entity.
    *
    * @param Rss $entity The entity
    *
    * @return \Symfony\Component\Form\Form The form
    */
    private function createCreateForm(Rss $entity)
    {
        $form = $this->createForm(new RssType(), $entity, array(
            'action' => $this->generateUrl('rss_create'),
            'method' => 'POST',
            'attr'     => array('id' => 'rss_add'),
        ));

        $form->add('submit', 'submit', array('label' => 'Create'));

        return $form;
    }

    /**
     * Displays a form to create a new Rss entity.
     *
     * @Route("/new", name="rss_new")
     * @Method("GET")
     * @Template()
     */
    public function newAction()
    {
        $entity = new Rss();
        $form   = $this->createCreateForm($entity);

        return array(
            'entity' => $entity,
            'form'   => $form->createView(),
        );
    }


    /**
     * @Route("/gettag", name="get_tags", options={"expose"=true})
     */
    public function changeTagsAction() {
        $tags = array();
        $repository = $this->getDoctrine()
            ->getRepository('RSSReaderBundle:Tags');
        $x = $this->getRequest()->get('term');
        $query = $repository->createQueryBuilder('p')
            ->select('DISTINCT p.tag')
            ->where("p.tag LIKE '%".strval($x)."%'")
            ->getQuery();
        $entities = $query->getResult();
        foreach ($entities as $tag) {
            array_push($tags,$tag['tag']);
        }
        $response = new Response(json_encode($tags));
        $response->headers->set('Content-Type', 'application/json');
        return $response;
    }


    /**
     * @Route("/dtag/{id}", name="delete_tag", options={"expose"=true})
     */
    public function dtagAction($id) {
        $em = $this->getDoctrine()->getManager();
        $tag = $em->getRepository('RSSReaderBundle:Tags')->find($id);
        $em->remove($tag);
        $em->flush();
        return $this->redirect($this->generateUrl('rss_list'));
    }


    /**
     * @Route("/addTag/{name}/{id}", name="add_tag", options={"expose"=true})
     */
    public function addTagAction($name, $id) {
        $em = $this->getDoctrine()->getManager();
        $rss = $em->getRepository("RSSReaderBundle:Rss")->find($id);
        $tag = new Tags();
        $tag->setTag($name);
        $tag->setIdRss($rss);
        $em->persist($tag);
        $em->flush();
        return $this->redirect($this->generateUrl('rss_list'));
    }

    /**
     * @Route("/removeTag/{name}/{id}", name="remove_tag", options={"expose"=true})
     */
    public function rTagAction($name, $id) {
        $em = $this->getDoctrine()->getManager();
        $rss = $em->getRepository("RSSReaderBundle:Rss")->find($id);
        $tag = $em->getRepository("RSSReaderBundle:Tags")->findOneBy(array('idRss' => $rss, 'tag' => $name));
        $em->remove($tag);
        $em->flush();
        return $this->redirect($this->generateUrl('rss_list'));
    }


    /**
     * Finds and displays a Rss entity.
     *
     * @Route("/show/{id}", name="rss_show")
     * @Template()
     */
    public function showAction($id, Request $request)
    {
        $temp = array();
        $em = $this->getDoctrine()->getManager();
        $entity = $em->getRepository('RSSReaderBundle:Rss')->find($id);
        $tags = $em->getRepository('RSSReaderBundle:Tags')->findByIdRss($entity->getId());
        $form = $this->createFormBuilder(null,array('attr' => array('id' => 'add_tag')))
            ->add('Tags', 'text', array('attr' => array('id' => 'input_tag')))
            ->add('Add tags','submit')
            ->getForm();

        $form->handleRequest($request);
        if ($form->isValid()) {
            $tags = explode(',',$form->get('Tags')->getData());
            $var = $em->getRepository('RSSReaderBundle:Tags')->findByIdRss($entity->getId());
            foreach ($var as $element) {
                array_push($temp,$element->getTag());
            }
            foreach ($tags as $tag) {
                $tag = trim($tag);
                if (!in_array($tag,$temp)) {
                    if ($tag != '' && $tag != ' ') {
                        $tag_db = new Tags();
                        $tag_db->setTag($tag);
                        $tag_db->setIdRss($entity);
                        $em->persist($tag_db);
                    }
                }
            }
            $em->flush();
            $var = $em->getRepository('RSSReaderBundle:Tags')->findByIdRss($entity->getId());
            return $this->render('RSSReaderBundle:Rss:showTags.html.twig', array('tags' => $var));
            //return $this->redirect($this->generateUrl('rss_show', array('id' => $entity->getId())));
        }

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Rss entity.');
        }

        $deleteForm = $this->createDeleteForm($id);

        return array(
            'tags_form'   => $form->createView(),
            'tags'        => $tags,
            'entity'      => $entity,
            'delete_form' => $deleteForm->createView(),
        );
    }

    /**
     * Displays a form to edit an existing Rss entity.
     *
     * @Route("/edit/{id}", name="rss_edit")
     * @Method("GET")
     * @Template()
     */
    public function editAction($id)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('RSSReaderBundle:Rss')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Rss entity.');
        }

        $editForm = $this->createEditForm($entity);
        $deleteForm = $this->createDeleteForm($id);

        return array(
            'entity'      => $entity,
            'edit_form'   => $editForm->createView(),
            'delete_form' => $deleteForm->createView(),
        );
    }

    /**
    * Creates a form to edit a Rss entity.
    *
    * @param Rss $entity The entity
    *
    * @return \Symfony\Component\Form\Form The form
    */
    private function createEditForm(Rss $entity)
    {
        $form = $this->createForm(new RssType(), $entity, array(
            'action' => $this->generateUrl('rss_update', array('id' => $entity->getId())),
            'method' => 'PUT',
            'attr'   => array('id' => 'rss_edit'),
        ));

        $form->add('submit', 'submit', array('label' => 'Update'));

        return $form;
    }
    /**
     * Edits an existing Rss entity.
     *
     * @Route("/{id}", name="rss_update")
     * @Method("PUT")
     * @Template("RSSReaderBundle:Rss:edit.html.twig")
     */
    public function updateAction(Request $request, $id)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('RSSReaderBundle:Rss')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Rss entity.');
        }

        $deleteForm = $this->createDeleteForm($id);
        $editForm = $this->createEditForm($entity);
        $editForm->handleRequest($request);

        if ($editForm->isValid()) {
            $entity->setUpdateDate(new \DateTime("now"));
            $em->flush();

            return $this->redirect($this->generateUrl('rss_edit', array('id' => $id)));
        }

        return array(
            'entity'      => $entity,
            'edit_form'   => $editForm->createView(),
            'delete_form' => $deleteForm->createView(),
        );
    }
    /**
     * Deletes a Rss entity.
     * @Method("DELETE")
     * @Route("/delete/{id}", name="rss_delete")
     */
    public function deleteAction(Request $request, $id)
    {
        $form = $this->createDeleteForm($id);
        $form->handleRequest($request);

        if ($form->isValid()) {
            $em = $this->getDoctrine()->getManager();
            $entity = $em->getRepository('RSSReaderBundle:Rss')->find($id);

            if (!$entity) {
                throw $this->createNotFoundException('Unable to find Rss entity.');
            }

            $em->remove($entity);
            $em->flush();
        }

        return $this->redirect($this->generateUrl('rss_list'));
    }

    /**
     * Creates a form to delete a Rss entity by id.
     *
     * @param mixed $id The entity id
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createDeleteForm($id)
    {
        return $this->createFormBuilder()
            ->setAction($this->generateUrl('rss_delete', array('id' => $id)))
            ->setMethod("DELETE")
            ->add('submit', 'submit', array('label' => 'Delete'))
            ->getForm()
        ;
    }
}
